import Web3 from 'web3';
import { config } from './config';

// Initialize contract & set global variables
export async function initContract() {
    window.web3 = new Web3(window.ethereum);
    await window.ethereum.enable();

    const accounts = await window.ethereum
        .request({ method: 'eth_accounts' });

    window.userAddress = accounts[0];

    window.poolFactory = new window.web3.eth.Contract(
        config.poolFactoryAbi,
        config.poolFactoryAddress,
        { from: window.userAddress }
    );

    window.tokenFaucet = new window.web3.eth.Contract(
        config.tokenFaucetAbi,
        config.tokenFaucetAddress,
        { from: window.userAddress }
    );

    window.ethInitialized = true;

    window.ethereum.on('accountsChanged', () => {
        window.location.reload();
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
};
