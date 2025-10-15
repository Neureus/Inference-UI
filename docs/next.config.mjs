import nextra from 'nextra';

const withNextra = nextra({
  latex: false,
  search: {
    codeblocks: false,
  },
  defaultShowCopyCode: true,
});

export default withNextra({
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.BASE_PATH || '',
  trailingSlash: true,
});
