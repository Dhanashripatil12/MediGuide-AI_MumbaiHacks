import * as React from "react"

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => {
  const variants = {
    default: "bg-white border-gray-300",
    destructive: "border-red-500 bg-red-50 text-red-800"
  }
  
  return (
    <div
      ref={ref}
      role="alert"
      className={`relative w-full rounded-lg border p-4 ${variants[variant] || variants.default} ${className || ""}`}
      {...props}
    />
  )
})
Alert.displayName = "Alert"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm ${className || ""}`}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription }
