'use client';
import { FC } from 'react';
import SigninComponent from './sign-in';

const SigninPage: FC = () => {
    return (
        <main>
            <div className="max-w-md mx-auto p-4 border border-gray-300 rounded-lg shadow-md">

                <SigninComponent />
            </div>
        </main>
    );
};

export default SigninPage;