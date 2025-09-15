# TODO: Update ForgetPassword Component to Use React Hook Form

## Tasks
- [x] Import necessary hooks: useForm from 'react-hook-form', keep useState for success, useNavigate
- [x] Initialize useForm hook with register, handleSubmit, formState (errors, isValid), watch
- [x] Remove useState for form fields (oldPassword, newPassword, confirmPassword) and error
- [x] Update input fields to use register with validation rules:
  - oldPassword: required
  - newPassword: required
  - confirmPassword: required and validate matching with newPassword
- [x] Update handleSubmit to use form hook's handleSubmit and create onSubmit function for API call and success handling
- [x] Update error display to use formState.errors
- [x] Update button disabled logic to use isValid
- [x] Keep success state and cancel functionality
- [ ] Test the updated component by running the dev server
