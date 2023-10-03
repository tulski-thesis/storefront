import { PaymentSession } from "@medusajs/medusa"
import React from "react"

type WrapperProps = {
  paymentSession?: PaymentSession | null
}

const Wrapper: React.FC<WrapperProps> = ({ paymentSession, children }) => {
  return <div>{children}</div>
}

export default Wrapper
