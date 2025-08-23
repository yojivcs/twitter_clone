import React, { useEffect, useState } from 'react';
import { GiAndroidMask } from 'react-icons/gi';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { clearError, register } from '../redux/slices/authSlice';

const RegisterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
`;

const RegisterForm = styled.form`
  width: 100%;
  max-width: 400px;
  padding: 30px;
  border-radius: 15px;
  background-color: ${({ theme }) => theme.background};
  box-shadow: ${({ theme }) => theme.boxShadow};
`;

const Logo = styled.div`
  font-size: 40px;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 30px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  font-size: 16px;
  background-color: transparent;
  color: ${({ theme }) => theme.text};

  &:focus {
    border-color: ${({ theme }) => theme.primary};
    outline: none;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: ${({ theme }) => theme.primary};
  color: white;
  border-radius: 30px;
  font-size: 16px;
  font-weight: bold;
  margin-top: 10px;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.buttonHover};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.error};
  margin-bottom: 20px;
  text-align: center;
`;

const LoginLink = styled.div`
  margin-top: 20px;
  text-align: center;
`;

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const { name, username, email, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear validation error when user types
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!name) {
      errors.name = 'Name is required';
    }
    
    if (!username) {
      errors.username = 'Username is required';
    } else if (username.length > 15) {
      errors.username = 'Username cannot be more than 15 characters';
    }
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = formData;
      dispatch(register(registerData));
    }
  };

  return (
    <RegisterContainer>
      <RegisterForm onSubmit={onSubmit}>
        <Logo>
          <GiAndroidMask />
        </Logo>
        <Title>Create your account</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <FormGroup>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={onChange}
            placeholder="Enter your name"
          />
          {formErrors.name && <ErrorMessage>{formErrors.name}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="username">Username</Label>
          <Input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={onChange}
            placeholder="Enter your username"
          />
          {formErrors.username && <ErrorMessage>{formErrors.username}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={onChange}
            placeholder="Enter your email"
          />
          {formErrors.email && <ErrorMessage>{formErrors.email}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={onChange}
            placeholder="Enter your password"
          />
          {formErrors.password && <ErrorMessage>{formErrors.password}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={onChange}
            placeholder="Confirm your password"
          />
          {formErrors.confirmPassword && <ErrorMessage>{formErrors.confirmPassword}</ErrorMessage>}
        </FormGroup>
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign up'}
        </Button>
        
        <LoginLink>
          Already have an account? <Link to="/login">Log in</Link>
        </LoginLink>
      </RegisterForm>
    </RegisterContainer>
  );
};

export default Register; 