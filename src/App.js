import React, { useEffect, useState } from "react";
import {
  ChakraProvider,
  Box,
  Text,
  VStack,
  Grid,
  theme,
  Button,
  HStack,
  Input,
  AlertIcon,
  AlertDescription,
  AlertTitle,
  Alert,
  useToast,
} from "@chakra-ui/react";
import {
  connect,
  isMetaMaskInstalled,
  getProvider,
  getSigner,
} from "./connection/metamask";
import { formatEther, Contract } from "ethers";
import teamLead from "./abi/teamLead.json";

function App() {
  const [account, setAccount] = useState("");
  const [myBalance, setMyBalance] = useState("");
  const [teamLeadName, setTeamLeadName] = useState("");
  const [newTeamLead, setNewTeamLead] = useState("");
  const [chainError, setChainError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (account) {
      getBalance(account);
      setChainError(null);
    }
  }, [account]);

  useEffect(() => {
    if (window.ethereum) {
      const teamLeadContract = async () => {
        const signer = await getSigner();
        // Create a contract
        const contract = new Contract(
          "0xB0b72FB76a9390943A869eD2e837D183Cd44F954",
          teamLead,
          signer
        );

        contract.on("LeadSet", (sender, newTeamLead) => {
          console.log("sender ", sender);
          console.log("new team lead ", newTeamLead);
        });
      };

      teamLeadContract();
    }
  }, []);

  const checkMetamask = async () => {
    if (isMetaMaskInstalled) {
      if (window.ethereum.chainId === "0x13881") {
        const userAccount = await connect();
        console.log(userAccount);
        setAccount(userAccount[0]);
      } else {
        setChainError("change to Mumbai Polygon");
        throw new Error("change to Mumbai Polygon");
      }
    } else {
      throw new Error("Install metamask");
    }
  };

  const getBalance = async (myAccount) => {
    const provider = getProvider();
    const balance = await provider.getBalance(myAccount);
    console.log(formatEther(balance));
    setMyBalance(formatEther(balance));
    return balance;
  };

  const teamLeadContract = async () => {
    const signer = await getSigner();
    // Create a contract
    const teamLeadContract = new Contract(
      "0xB0b72FB76a9390943A869eD2e837D183Cd44F954",
      teamLead,
      signer
    );
    return teamLeadContract;
  };

  const getTeamLead = async () => {
    try {
      const teamLeadCon = await teamLeadContract();
      const currentTeamLead = await teamLeadCon.getLead();
      setTeamLeadName(currentTeamLead);
    } catch (error) {
      console.log(error);
    }
  };

  const setWinner = async () => {
    try {
      const teamLeadCon = await teamLeadContract();
      const tx = await teamLeadCon.setLead(newTeamLead);
      const receipt = await tx.wait(1);
      if (receipt.status) {
        toast({
          position: "bottom-left",
          render: () => (
            <Box color="white" p={3} bg="green.500">
              Transaction successful
            </Box>
          ),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const walletConnection = () => {
    try {
      checkMetamask();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <VStack spacing={8}>
            {chainError && (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>Wrong Network!</AlertTitle>
                <AlertDescription>
                  Please change to Polygon Mumbai testnet
                </AlertDescription>
              </Alert>
            )}
            <Text>Team Lead App</Text>
            <Text>{account}</Text>
            <Text>{myBalance}</Text>
            <Button onClick={walletConnection} disabled={account}>
              {account ? "Connected" : "Connect Wallet"}
            </Button>
            <HStack spacing="24px">
              <Button onClick={getTeamLead}>Get Team Lead</Button>
              <Text>{teamLeadName}</Text>
            </HStack>
            <HStack spacing="24px">
              <Input
                value={newTeamLead}
                onChange={(e) => setNewTeamLead(e.target.value)}
              ></Input>
              <Button onClick={setWinner}>Set Team Lead</Button>
            </HStack>
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
}

export default App;
