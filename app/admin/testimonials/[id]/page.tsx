
import Form from './Form';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Edit Testimonial ${id}` };
}

export default async function TestimonialEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Form id={id} />
  );
}
