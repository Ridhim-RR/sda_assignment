import { Link } from 'react-router-dom'
import RegistrationForm from '../components/RegistrationForm'

export default function RegisterPage() {
  return (
    <section className="register-page">
      <div className="row register-head">
        <h2>Dataset Registration Form</h2>
        <Link to="/" className="secondary-link">
          Back
        </Link>
      </div>
      <RegistrationForm />
    </section>
  )
}
