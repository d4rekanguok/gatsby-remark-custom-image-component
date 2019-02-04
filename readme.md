# gatsby-remark-custom-image-component

This `gatsby-transformer-remark` plugin allows you to link images in [custom components](https://using-remark.gatsbyjs.org/custom-components/) in a similar fashion to `gatsby-remark-image`.

## Install

```bash
npm install gatsby-remark-custom-image-component
yarn add gatsby-remark-custom-image-component
```

## Usage

```js
// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-custom-images-src`,
            options: {
              // plugin options
              componentName: 'image-wrapper',
              imagePropName: 'src',
              sharpMethod: 'fluid',
              // fluid's arguments
              quality: 50,
              maxWidth: 800,
            }
          },
        ],
      },
    },
```

In your markdown:

```yaml
# src/content/hello-word/index.md
---
title: Hello World
date: '2015-05-01T22:12:03.284Z'
---

<image-wrapper src='./hero.jpg'></image-wrapper>
```

In your custom component:
```js
//src/components/ImageWrapper.js
import React from 'react'

export default ({ src, srcSet }) => <img src={src} srcSet={srcSet} />
```

In your template:

```js
//src/templates/blog-post.js
import React from 'react'
import rehypeReact from 'rehype-react'
import ImageWrapper from '../components/ImageWrapper'

const renderAst = new rehypeReact({
  createElement: React.createElement,
  components: { 'image-wrapper': ImageWrapper },
}).Compiler

const BlogPostTemplate = ({ data }) => {
  const post = this.props.data.markdownRemark
  return <div>{ renderAst(post.htmlAst) }</div>
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      htmlAst
    }
  }
`
```

## Options

| Name | Value | Note |
|---|---|---|
|componentName| string, default 'image-wrapper' | Custom component name, use in markdown |
|imagePropName| string, default 'src' | |
|sharpMethod| string, default 'fluid' | Sharp method, one of 'resize', 'fluid' or 'fixed'|

You can also pass in any of the selected sharp method's arguments. [Reference here](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-sharp).

