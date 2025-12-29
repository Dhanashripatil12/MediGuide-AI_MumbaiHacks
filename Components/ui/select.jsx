import * as React from "react"
import { ChevronDown } from "lucide-react"

const SelectContext = React.createContext({})

const Select = ({ value, onValueChange, children }) => {
  const [open, setOpen] = React.useState(false)
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, setOpen } = React.useContext(SelectContext)
  
  return (
    <button
      ref={ref}
      onClick={() => setOpen(!open)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
      {...props}
    >
      <span>{children}</span>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }) => {
  const { value } = React.useContext(SelectContext)
  return <span>{value || placeholder}</span>
}
SelectValue.displayName = "SelectValue"

const SelectContent = ({ children, ...props }) => {
  const { open } = React.useContext(SelectContext)
  
  if (!open) return null
  
  return (
    <div
      className="absolute top-full left-0 right-0 z-50 min-w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
      {...props}
    >
      {children}
    </div>
  )
}
SelectContent.displayName = "SelectContent"

const SelectItem = ({ value, children, ...props }) => {
  const { onValueChange, setOpen } = React.useContext(SelectContext)
  
  const handleClick = () => {
    onValueChange(value)
    setOpen(false)
  }
  
  return (
    <button
      onClick={handleClick}
      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
      {...props}
    >
      {children}
    </button>
  )
}
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
