"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface InputOTPProps extends React.InputHTMLAttributes<HTMLInputElement> {
  maxLength?: number
}

const InputOTP = React.forwardRef<HTMLInputElement, InputOTPProps>(
  ({ className, maxLength = 6, ...props }, ref) => {
    const [value, setValue] = React.useState("")
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useImperativeHandle(ref, () => inputRef.current!)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value.replace(/[^0-9]/g, "")
      if (newValue.length <= maxLength) {
        setValue(newValue)
        props.onChange?.(e)
      }
    }

    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        maxLength={maxLength}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-2xl tracking-widest ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        value={value}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
InputOTP.displayName = "InputOTP"

export { InputOTP }
