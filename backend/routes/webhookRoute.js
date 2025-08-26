import express from 'express'
import {webhookOmise} from '../controllers/webhookController.js'

const webhookRouter = express.Router();

webhookRouter.post('/omise', webhookOmise)

export default webhookRouter;



