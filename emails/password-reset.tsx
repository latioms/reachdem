import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';

type PasswordResetEmailProps = {
  userEmail: string;
  resetLink: string;
};

const PasswordResetEmail = ({ userEmail, resetLink }: PasswordResetEmailProps) => (
  <Html lang="en" dir="ltr">
    <Tailwind>
      <Head />
      <Preview>Reset your ReachDem password</Preview>
      <Body className="bg-gray-100 font-sans py-[40px]">
        <Container className="bg-white mx-auto px-[40px] py-[40px] max-w-[600px] rounded-[8px]">
          <Section className="text-center mb-[32px]">
            <Heading className="text-black text-[28px] font-bold m-0 mb-[8px]">
              ReachDem
            </Heading>
            <div className="w-[60px] h-[4px] bg-orange-500 mx-auto rounded-[2px]"></div>
          </Section>

          <Section className="mb-[32px]">
            <Heading className="text-black text-[24px] font-bold mb-[16px] m-0">
              Reset Your Password
            </Heading>

            <Text className="text-gray-700 text-[16px] leading-[24px] mb-[16px] m-0">
              We received a request to reset the password for your ReachDem account associated with <strong>{userEmail}</strong>.
            </Text>

            <Text className="text-gray-700 text-[16px] leading-[24px] mb-[24px] m-0">
              Click the button below to create a new password. This link will expire in 24 hours for security reasons.
            </Text>

            <Section className="text-center mb-[32px]">
              <Button
                href={resetLink}
                className="bg-black text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border border-[2px] border-solid border-black hover:bg-orange-500 hover:border-orange-500 transition-colors"
              >
                Reset Password
              </Button>
            </Section>

            <Text className="text-gray-600 text-[14px] leading-[20px] mb-[16px] m-0">
              If the button doesn't work, copy and paste this link into your browser:
            </Text>

            <Text className="text-orange-500 text-[14px] leading-[20px] mb-[24px] m-0 break-all">
              <Link href={resetLink} className="text-orange-500 underline">
                {resetLink}
              </Link>
            </Text>

            <Section className="bg-gray-50 p-[20px] rounded-[8px] border-l-[4px] border-solid border-orange-500">
              <Text className="text-gray-700 text-[14px] leading-[20px] m-0 mb-[8px]">
                <strong>Security Notice:</strong>
              </Text>
              <Text className="text-gray-600 text-[14px] leading-[20px] m-0">
                If you didn't request this password reset, please ignore this email. Your account remains secure and no changes have been made.
              </Text>
            </Section>
          </Section>

          <Section className="border-t border-solid border-gray-200 pt-[24px]">
            <Text className="text-gray-500 text-[12px] leading-[16px] text-center m-0 mb-[8px]">
              This email was sent by ReachDem
            </Text>
            <Text className="text-gray-500 text-[12px] leading-[16px] text-center m-0 mb-[8px]">
              Kotto Neptune St, Douala CM
            </Text>
            <Text className="text-gray-500 text-[12px] leading-[16px] text-center m-0">
              © 2025 ReachDem. All rights reserved. |
              <Link href="https://reachdem.com/unsubscribe" className="text-orange-500 underline ml-[4px]">
                Unsubscribe
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default PasswordResetEmail;
