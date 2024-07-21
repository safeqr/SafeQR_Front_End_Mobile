import { useState, useEffect } from 'react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { UserAttributes } from '../types'

const useFetchUserAttributes = () => {
  const [userAttributes, setUserAttributes] = useState<UserAttributes | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleFetchUserAttributes = async () => {
      try {
        const attributes = await fetchUserAttributes();
        setUserAttributes(attributes as unknown as UserAttributes);
      } catch (error: any) {
        console.log("Error in use fetch user attributes: ", error);
        
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    handleFetchUserAttributes();
  }, []);

  return { userAttributes, loading, error };
};

export default useFetchUserAttributes;
