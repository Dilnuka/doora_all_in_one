import { auth } from "@/lib/auth";
import { CheckoutForm } from "@/components/food/checkout-form";

export default async function FoodCheckoutPage() {
  const session = await auth();
  const user = session!.user;

  return (
    <CheckoutForm defaultTower={user.tower} defaultApartment={user.apartment} />
  );
}
