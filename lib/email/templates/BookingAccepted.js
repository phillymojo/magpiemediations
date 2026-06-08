import { Html, Head, Body, Container, Heading, Text, Hr } from 'react-email'

const SESSION_LABELS = { HALF_DAY: 'Half-Day (~4 hours)', FULL_DAY: 'Full-Day (~8 hours)' }

export function BookingAccepted({ firstName, mediatorName, sessionType, preferredDate }) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', color: '#1E2A3A', backgroundColor: '#F4F7FB' }}>
        <Container style={{ maxWidth: '560px', margin: '40px auto', backgroundColor: '#fff', padding: '40px', borderRadius: '8px' }}>
          <Heading style={{ color: '#12284C', fontSize: '22px', marginBottom: '8px' }}>
            Your Session is Confirmed
          </Heading>
          <Text>Hi {firstName},</Text>
          <Text>
            Great news — your mediation session request has been confirmed by {mediatorName}.
          </Text>
          <Hr />
          <Text><strong>Mediator:</strong> {mediatorName}</Text>
          <Text><strong>Session Type:</strong> {SESSION_LABELS[sessionType]}</Text>
          <Text><strong>Preferred Date:</strong> {preferredDate}</Text>
          <Text><strong>Status:</strong> Confirmed</Text>
          <Hr />
          <Text>
            The mediator will be in touch to coordinate final details.
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
