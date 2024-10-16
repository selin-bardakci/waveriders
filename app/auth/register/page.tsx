"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Work_Sans } from 'next/font/google';

const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [lastname, setLastName] = useState('');
  const [birthdate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(''); // New phone number state
  const [isChecked, setIsChecked] = useState(false); // Checkbox state
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Success message state
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isChecked) {
      setError('You must accept the Terms of Service.');
      return;
    }

    try {
      const response = await axios.post('/auth/register', {
        name,
        lastname,
        email,
        password,
        phone, // Include phone number in the request payload
      });

      console.log(response.data);
      setSuccessMessage('Registration successful. Verification email has been sent.'); // Show success message
      // You can redirect after successful registration
      // router.push('/auth/sign-in');
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.log(err);
    }
  };

  return (
    <Container>
      <Header>Register as a Customer</Header>

      <FormWrapper onSubmit={handleSubmit}>
        <div>
          <InputLabel htmlFor="firstName">First Name</InputLabel>
          <InputField
            id="firstName"
            type="text"
            placeholder="First Name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          />
        </div>

        <div>
          <InputLabel htmlFor="lastName">Last Name</InputLabel>
          <InputField
            id="lastName"
            type="text"
            placeholder="Last Name"
            value={lastname}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
          />
        </div>

        <div>
          <InputLabel htmlFor="birthDate">Birth Date</InputLabel>
          <DateInputField
            id="birthDate"
            type="date"
            value={birthdate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBirthDate(e.target.value)}
          />
        </div>

        <div>
          <InputLabel htmlFor="email">Email Address</InputLabel>
          <InputField
            id="email"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <InputLabel htmlFor="phone">Phone Number</InputLabel>
          <InputField
            id="phone"
            type="tel" // Input type for phone number
            placeholder="Phone Number"
            value={phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
          />
        </div>

        <div>
          <InputLabel htmlFor="password">Password</InputLabel>
          <InputField
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />
        </div>

        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="terms"
            checked={isChecked}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsChecked(e.target.checked)}
          />
          <TermsText>I accept the WaveRiders Terms of Service</TermsText>
        </CheckboxWrapper>

        {error && <ErrorText>{error}</ErrorText>} {/* Display error message */}
        {successMessage && <SuccessText>{successMessage}</SuccessText>} {/* Display success message */}

        <SubmitButton type="submit" disabled={!isChecked}>Register</SubmitButton> {/* Disable button if checkbox is not checked */}
      </FormWrapper>
    </Container>
  );
};

export default RegisterForm;

const workSans = Work_Sans({ subsets: ["latin"], weight: ['400', '700'] });

const Container = styled.div`
  position: relative;
  width: 1200px;
  height: 900px;
  background: #f7fafc;
`;

const Header = styled.div`
  position: absolute;
  top: 92px;
  left: 867px;
  width: 928px;
  height: 40px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 32px;
  line-height: 40px;
  color: #0d141c;
`;

const FormWrapper = styled.form`
  position: absolute;
  top: 147px;
  left: 867px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 448px;
  min-width: 160px;
`;

const InputLabel = styled.label`
  width: 448px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #0d141c;
`;

const InputField = styled.input`
  width: 448px;
  height: 56px;
  padding: 16px;
  background: #e8edf5;
  border-radius: 12px;
  border: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #4a789c;
`;

const DateInputField = styled(InputField)`
  height: 56px; /* Same height as other input fields */
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 12px;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  margin-right: 8px;
  border: 2px solid #2194f2;
  border-radius: 4px;
`;

const TermsText = styled.span`
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
  font-size: 16px;
  color: #0d141c;
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 48px;
  background: #2194f2;
  border-radius: 12px;
  border: none;
  color: #f7fafc;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 16px;
  text-align: center;
  cursor: pointer;
  margin-top: 16px;
  opacity: ${props => (props.disabled ? 0.6 : 1)};
  pointer-events: ${props => (props.disabled ? 'none' : 'auto')}; /* Disable interaction if checkbox is not checked */
`;

const ErrorText = styled.div`
  color: red;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
  font-size: 16px;
`;

const SuccessText = styled.div`
  color: green; /* Green color for success message */
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
  font-size: 16px;
`;
