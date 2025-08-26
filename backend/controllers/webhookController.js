
import orderModel from "../models/orderModel.js";


const webhookOmise = async (req, res) => {
  const event = req.body;

  try {
    if (event.key === "charge.succeeded") {
      await orderModel.findOneAndUpdate(
        { chargeId: event.data.id },
        { payment: true, status: "PAID" }
      );
    } else if (event.key === "charge.failed" || event.key === "charge.expired") {
      await orderModel.findOneAndUpdate(
        { chargeId: event.data.id },
        { payment: false, status: "FAILED" }
      );
    }

    res.status(200).send("ok");
  } catch (err) {
    console.error("Webhook error", err);
    res.status(500).send("error");
  }
}

export  {webhookOmise};
