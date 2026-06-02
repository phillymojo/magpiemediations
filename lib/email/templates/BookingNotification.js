import { Html, Head, Body, Container, Heading, Text, Hr } from 'react-email'

const SESSION_LABELS = { HALF_DAY: 'Half-Day (~4 hours)', FULL_DAY: 'Full-Day (~8 hours)' }

// Case description is intentionally NOT included — privileged content per constitution Principle I.
export function BookingNotification({ mediatorName, sessionType, preferredDate }) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', color: '#1E2A3A', backgroundColor: '#F4F7FB' }}>
        <Container style={{ maxWidth: '560px', margin: '40px auto', backgroundColor: '#fff', padding: '40px', borderRadius: '8px' }}>
          <Heading style={{ color: '#12284C', fontSize: '22px', marginBottom: '8px' }}>
            New Booking Request
          </Heading>
          <Text>Hi {mediatorName},</Text>
          <Text>
            You have received a new mediation session request on Magpie Mediations.
          </Text>
          <Hr />
          <Text><strong>Session Type:</strong> {SESSION_LABELS[sessionType]}</Text>
          <Text><strong>Preferred Date:</strong> {preferredDate}</Text>
          <Text><strong>Status:</strong> Pending Your Confirmation</Text>
          <Hr />
          <Text>
            Please follow up with the requesting party directly to confirm availability
            and next steps. A mediator portal for managing bookings is coming soon.
          </Text>
          <Text style={{ fontSize: '11px', color: '#607080', marginTop: '32px' }}>
            Magpie Mediations LLC is a technology platform, not a law firm, and does not provide
            legal advice or legal representation.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
