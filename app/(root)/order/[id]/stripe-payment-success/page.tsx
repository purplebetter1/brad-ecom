import Stripe from "stripe";
import { getOrderById } from "@/lib/actions/order.actions";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const SuccessPage = async (props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment_intent: string }>;
}) => {
  const { id } = await props.params;
  const { payment_intent: paymentIntentId } = await props.searchParams;

  // Fetch order
  const order = getOrderById(id);
  if (!order) notFound();

  // Retrieve payment intent
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  // Check if payment intent is valid
  if (
    paymentIntent.metadata.orderId == null ||
    paymentIntent.metadata.orderId !== order.id.toString()
  ) {
    return notFound();
  }

  // Check if payment is successful
  const isSuccess = paymentIntent.status === "succeeded";
  if (!isSuccess) return redirect(`/order/${id}`);

  return (
    <div className="max-2-4xl w-full mx-auto space-y-8">
      <div className="flex flex-col gap-6 items">
        <h1 className="h1-bold">Thanks for your purchase</h1>
        <div>We are processing your order</div>
        <Button asChild>
          <Link href={`/order/${id}`}>View Order</Link>
        </Button>
      </div>
    </div>
  );
};

export default SuccessPage;
