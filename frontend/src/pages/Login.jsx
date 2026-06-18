import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AuthContext from '../context/AuthContext';

const Login = () => {
  const { login } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome!');
      navigate('/');
    } catch (e) {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-gray-100">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="mt-1 block w-full rounded border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              {...register('password', { required: 'Password is required' })}
              className="mt-1 block w-full rounded border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded bg-indigo-600 hover:bg-indigo-700 text-white py-2 font-semibold transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
