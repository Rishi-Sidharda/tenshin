export function polarPay(billingCycle, customerID, customerEmail) {
  let productid = "";

  if (billingCycle === "monthly") {
    productid = process.env.NEXT_PUBLIC_POLAR_PRO_PLAN_ID_MONTHLY;
  } else {
    productid = process.env.NEXT_PUBLIC_POLAR_PRO_PLAN_ID_YEARLY;
  }

  window.location.href = `/checkout?products=${productid}&customerExternalId=${customerID}&customerEmail=${customerEmail}`;
}
