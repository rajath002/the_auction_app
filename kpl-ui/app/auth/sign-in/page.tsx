'use client';
import { FC } from 'react';
import SigninComponent from './sign-in';

const SigninPage: FC = () => {
    return (
        <main>
            <div className="max-w-md mx-auto p-4 border border-gray-300 rounded-lg shadow-md">
                <h1 className="text-center text-2xl font-bold mb-4">Sign In</h1>
                <SigninComponent />
            </div>
        </main>
    );
};

export default SigninPage;