export function polarPay(billingCycle, customerID, customerEmail) {
  let productid = "";

  if (billingCycle === "monthly") {
    productid = "88d70166-86cb-4918-85e1-8103fc2469d2";
  } else {
    productid = "550d688e-539e-4198-88b0-000987f3fac9";
  }

  window.location.href = `/checkout?products=${productid}&customerExternalId=${customerID}&customerEmail=${customerEmail}`;
}
