const path = require('path')
const { selectAll } = require('unist-util-select');
const parse5 = require('parse5');
const sharp = require(`gatsby-plugin-sharp`)

module.exports = async ({ markdownAST: mdast, markdownNode, files, getNode, reporter, cache, pathPrefix }, pluginOptions) => {
  const { 
    plugins, 
    componentName='image-wrapper',
    imagePropName='src',
    sharpMethod='fluid',
    ...imageOptions
  } = pluginOptions;

  if (['fluid', 'fixed', 'resize'].indexOf(sharpMethod) < 0) reporter.panic(`'sharpMethod' only accepts 'fluid', 'fixed' or 'resize', got ${sharpMethod} instead.`);

  const targetNodes = selectAll('html', mdast);
  targetNodes.forEach(async node => {
    if (!node.value) return;
    if (!node.value.includes(`<${componentName}`)) return;

    // locate the custom markdown syntax node
    const parsed = parse5.parseFragment(node.value);
    const customNode = parsed.childNodes.find(node => node.tagName = componentName);
    const originSrc = customNode.attrs.find(attr => attr.name === imagePropName);
    const { value:imageRelativePath } = originSrc;
    if (!imageRelativePath) return;
    
    // gatsby File node
    const gFileNode = getNode(markdownNode.parent);
    const imageAbsolutePath = path.resolve(gFileNode.dir, imageRelativePath);

    // if the image path doesn't exist, ignore
    const gImageNode = files.find(file => file.absolutePath && file.absolutePath === imageAbsolutePath);
    if (!gImageNode) {
      const { fileAbsolutePath } = markdownNode;
      reporter.error(`${fileAbsolutePath}: No image found at ${imageAbsolutePath}`)
      return;
    }

    // get gatsby' already built fluid image
    const args = Object.assign({
      pathPrefix,
      withWebp: false, // not doing webp right now
    }, imageOptions);
    const getImage = sharp[sharpMethod];
    
    let imageResult = await getImage({
      file: gImageNode,
      args,
      reporter,
      cache,
    });

    if (!imageResult) return;

    // overwrite original src
    const { src, ...otherImageRes } = imageResult;
    originSrc.value = src;

    // add each of imageResult's value to name
    Object.keys(otherImageRes).forEach(key => {
      customNode.attrs.push({
        name: key,
        value: otherImageRes[key].toString(), // some value are numbers
      })
    });
    
    // re-serialize the node
    node.value = parse5.serialize(parsed);
  })
}