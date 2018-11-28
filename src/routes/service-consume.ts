import {
  default as express,
  Request,
  Response,
}                             from 'express'

export const serviceConsumeRouter = express.Router()

/**
 * @swagger
 *
 * /service/consume:
 *   get:
 *     tags:
 *       - ['service-consume']
 *     description: Get all services in the register
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK
 */
serviceConsumeRouter.use('/consume', async (_: Request, res: Response) => {
  res.send({error: null})
})