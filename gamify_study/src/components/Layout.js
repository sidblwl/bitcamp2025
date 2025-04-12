import React from 'react';
// import './Layout.css'; // (Optional if you want component-specific styles)

function Layout({ children }) {
  return <div className="container">{children}</div>;
}

export default Layout;