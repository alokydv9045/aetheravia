
import Form from './Form';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Edit User ${id}`,
  };
}

export default async function UserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Form userId={id} />
  );
}
