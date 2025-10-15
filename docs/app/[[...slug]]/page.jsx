import { getPage, getPages } from 'nextra/page';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return getPages().map((page) => ({
    slug: page.route.split('/').filter(Boolean),
  }));
}

export async function generateMetadata({ params }) {
  const { slug = [] } = await params;
  const page = getPage(slug);

  if (!page) return {};

  return {
    title: page.frontMatter?.title || page.name,
    description: page.frontMatter?.description,
  };
}

export default async function Page({ params }) {
  const { slug = [] } = await params;
  const page = getPage(slug);

  if (!page) {
    notFound();
  }

  const { default: MDXContent, toc, ...rest } = page;

  return (
    <>
      <MDXContent {...rest} />
    </>
  );
}
