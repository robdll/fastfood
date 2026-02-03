import './Footer.css'

function Footer({ text }) {
  return (
    <footer className="siteFooter">
      <div className="siteFooter__inner">{text}</div>
    </footer>
  )
}

export default Footer
