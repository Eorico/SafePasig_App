declare module 'react-native-phone-call' {
  type CallArgs = {
    number: string;
    prompt?: boolean;  
  };
  function call(args: CallArgs): Promise<void>;
  export default call;
}
