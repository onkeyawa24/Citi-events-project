import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: 'eu-north-1',
    userPoolId: 'eu-north-1_qorUsrUD4', 
    userPoolWebClientId: '17suc0fv4d86tt8i5dd9phjd0gi', 
  }
});

