
import orderModel from "../models/orderModel.js";


const webhookOmise = async (req, res) => {
    try {
        const event = req.body;
        const chargeId = event.id;
        const status = event.status;
        const paid = event.paid;

        const order = await orderModel.findOne({ chargeId });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (status === "successful" && paid) {
            order.status = "PAID";
            order.payment = true;
        } else {
            order.status = "FAILED";
            order.payment = false;
        }

        await order.save();

        res.status(200).json({ received: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ received: false });
    }
}

export { webhookOmise };
