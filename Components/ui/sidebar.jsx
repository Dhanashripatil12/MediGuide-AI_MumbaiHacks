import * as React from "react"

const SidebarContext = React.createContext({})

const SidebarProvider = ({ children, ...props }) => {
  const [open, setOpen] = React.useState(true)
  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <div className="flex min-h-screen" {...props}>
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

const Sidebar = ({ children, className, ...props }) => (
  <aside className={`w-64 bg-white border-r border-gray-200 ${className || ""}`} {...props}>
    {children}
  </aside>
)

const SidebarHeader = ({ children, className, ...props }) => (
  <div className={`p-4 border-b border-gray-200 ${className || ""}`} {...props}>
    {children}
  </div>
)

const SidebarContent = ({ children, className, ...props }) => (
  <div className={`flex-1 overflow-y-auto ${className || ""}`} {...props}>
    {children}
  </div>
)

const SidebarGroup = ({ children, className, ...props }) => (
  <div className={`px-3 py-2 ${className || ""}`} {...props}>
    {children}
  </div>
)

const SidebarGroupContent = ({ children, ...props }) => (
  <div {...props}>{children}</div>
)

const SidebarMenu = ({ children, className, ...props }) => (
  <nav className={`space-y-1 ${className || ""}`} {...props}>
    {children}
  </nav>
)

const SidebarMenuItem = ({ children, ...props }) => (
  <div {...props}>{children}</div>
)

const SidebarMenuButton = ({ children, className, isActive, ...props }) => {
  const activeClass = isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
  return (
    <button
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeClass} ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  )
}

const SidebarFooter = ({ children, className, ...props }) => (
  <div className={`p-4 border-t border-gray-200 ${className || ""}`} {...props}>
    {children}
  </div>
)

const SidebarTrigger = ({ className, ...props }) => {
  const { setOpen } = React.useContext(SidebarContext)
  return (
    <button
      onClick={() => setOpen(prev => !prev)}
      className={`p-2 hover:bg-gray-100 rounded-md ${className || ""}`}
      {...props}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger
}
