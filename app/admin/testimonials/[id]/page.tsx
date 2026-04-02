
import Form from './Form';

export function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `Edit Testimonial ${params.id}` };
}

export default function TestimonialEditPage({ params }: { params: { id: string } }) {
  return (
    <Form id={params.id} />
  );
}
