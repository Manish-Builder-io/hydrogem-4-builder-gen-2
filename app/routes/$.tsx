// $.tsx
import {
  fetchOneEntry,
  isEditing,
  isPreviewing,
  Content,
} from '@builder.io/sdk-react/edge';
import type {LoaderFunction} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';

export const loader: LoaderFunction = async ({params, request}) => {
  const url = new URL(request.url);
  const apiKey = '112c9f1ce50d450ea4e478af2043a518'; // Replace with your actual API key
  const page = await fetchOneEntry({
    model: 'page',
    apiKey: '112c9f1ce50d450ea4e478af2043a518',
    options: url.searchParams,
    userAttributes: {
      urlPath: `/${params['*']}`,
    },
  });

  const isEditingOrPreviewing = isEditing() || isPreviewing();

  if (!page && !isEditingOrPreviewing) {
    throw new Response('Page Not Found', {
      status: 404,
      statusText: 'Page not found in Builder.io',
    });
  }

  return {page};
};

// Define and render the page.
export default function Page() {
  // Use the useLoaderData hook to get the Page data from `loader` above.
  const {page} = useLoaderData<typeof loader>();

  // Render the page content from Builder.io
  return (
    <Content
      canTrack={true}
      model="page"
      apiKey="112c9f1ce50d450ea4e478af2043a518"
      content={page}
      enrich={true}
    />
  );
}
