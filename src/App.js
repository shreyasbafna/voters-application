import { useEffect, useState } from "react";
import "./App.css";
import contract from "./contracts/Election.json";
import { ethers } from "ethers";
import styled from "styled-components";

const contractAddress = "0xaD04E7f15d9105E0AF5e9DBe5CFB56BDC4968a58";

const Flex = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: #f1fffb;
  border: 2px solid #29ab87;
  border-radius: 20px;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  gap: 128px;
`;

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [count, setCount] = useState(0);
  const [voter1, setVoter1] = useState(0);
  const [voter2, setVoter2] = useState(0);
  const [voted, setVoted] = useState(false);

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!");
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWalletHandler = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Please install Metamask!");
    }
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
    }
  };

  const getTotalCount = async () => {
    const { ethereum } = window;
    if (ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contracts = new ethers.Contract(
          contractAddress,
          contract,
          signer
        );
        const totalCount = await contracts.candidatesCount();
        console.log(totalCount.toNumber());
        setCount(totalCount.toNumber());
      } catch (err) {
        console.log(err);
      }
    }
  };

  const checkVoted = async () => {
    const { ethereum } = window;
    if (ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contracts = new ethers.Contract(
          contractAddress,
          contract,
          signer
        );
        const votedStatus = await contracts.voters(currentAccount);
        console.log("checkVoted", votedStatus);
        setVoted(votedStatus);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const getVoterCount = async (id) => {
    const { ethereum } = window;
    if (ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contracts = new ethers.Contract(
          contractAddress,
          contract,
          signer
        );
        const candidate1 = await contracts.candidates(1);
        const candidate2 = await contracts.candidates(2);
        setVoter1(candidate1.voteCount.toNumber());
        setVoter2(candidate2.voteCount.toNumber());
      } catch (err) {
        console.log(err);
      }
    }
  };

  const voteHandler = async (id) => {
    const { ethereum } = window;
    if (ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contracts = new ethers.Contract(
          contractAddress,
          contract,
          signer
        );
        await contracts.vote(id);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const connectWalletButton = () => {
    return <button onClick={connectWalletHandler}>Connect Wallet</button>;
  };

  useEffect(() => {
    checkWalletIsConnected();
    getTotalCount();
    getVoterCount();
    checkVoted();
  }, [currentAccount, checkVoted]);

  const candidateDetails = () => {
    return (
      <Container>
        <Flex>
          Total votes : {voter1}
          {!voted ? (
            <button onClick={() => voteHandler(1)}>Vote</button>
          ) : (
            <h3 style={{ color: "#29AB87" }}>You have already voted</h3>
          )}
        </Flex>
        <Flex>
          Total votes : {voter2}
          {!voted ? (
            <button onClick={() => voteHandler(2)}>Vote</button>
          ) : (
            <h3 style={{ color: "#29AB87" }}>You have already voted</h3>
          )}
        </Flex>
      </Container>
    );
  };

  return (
    <div className="main-app">
      {count > 0 && (
        <h2 style={{ color: "#29AB87" }}>Total No of Candidates : {count}</h2>
      )}
      <div>{!currentAccount && connectWalletButton()}</div>
      {count > 0 && candidateDetails()}
    </div>
  );
}

export default App;
