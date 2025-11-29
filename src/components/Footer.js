export default function Footer() {
  return (
    <footer style={{
      background: "#1a1a1a",
      color: "white",
      padding: "15px",
      marginTop: "40px",
      textAlign: "center"
    }}>
      <p>© {new Date().getFullYear()} Time For Hire — All rights reserved.</p>
    </footer>
  );
}
