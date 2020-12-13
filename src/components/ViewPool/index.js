import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import history from "../Utils/history";
import Loading from "../Utils/Loading";
import AlertModal from "../Utils/AlertModal";
import SuccessModal from "../Utils/SuccessModal";
import metamask from "../../assets/metamask.png";
import { precision } from "../../utils/precision";
import { time } from "../../utils/time";
import * as poolAbi from "../../abis/pool.json";
import * as bep20Abi from "../../abis/bep20Abi.json"
import Bid from "../Bid";
import {
    Card,
    Row,
    Col,
    Image,
    Button,
    CardDeck
} from "react-bootstrap";
import Participate from "../Participate";

export default function ViewPool() {
    let routes;
    const BUSD = "0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47";
    const { poolAddress } = useParams();
    const [loading, setLoading] = useState(true);
    let [bep20Instance, setBep20Instance] = useState();
    let [contractInstance, setContractInstance] = useState();
    const [state, setState] = useState({
        maxBidAmount: 0,
        minBidAmount: 0,
        poolStartTimestamp: 0,
        isParticipant: false,
        alreadyTakenLoan: false,
        loanAmount: 0,
        depositAmount: 0,
        totalParticipants: 0,
        auctionCount: 0,
        autionStartTimestamp: 0,
        autionCloseTimestamp: 0,
        auctionInterval: 0,
        poolCloseTimestamp: 0,
        highestBidAmount: 0,
        isLoanWinner: false,
        winnerInAuction: 0,
        userCurrentBid: 0,
        claimedFinalYield: false,
        bep20Balance: 0,
        createdAt: 0,
    });
    const [successModal, setSuccessModal] = useState({
        msg: "",
        open: false
    });
    const [errorModal, setErrorModal] = useState({
        msg: "",
        open: false
    });
    const [claimingLoan, setClaimingLoan] = useState(false);
    const [claimingYield, setClaimingYield] = useState(false);
    const [showBid, setShowBid] = useState(false);
    const [showParticipate, setShowParticipate] = useState(false);
    const [showMetamaskError, setShowMetamaskError] = useState(false);

    const handleClaimLoan = async () => {
        contractInstance.methods.claimLoan()
            .send()
            .on('transactionHash', () => {
                setClaimingLoan(true);
            })
            .on('receipt', () => {
                setClaimingLoan(false);
                fetchContractData();
                setSuccessModal({
                    open: true,
                    msg: "Congratulations 🎉 !! " +
                        "You received loan amount in your wallet !!",
                });
            })
            .catch((error) => {
                setClaimingLoan(false);
                setErrorModal({
                    open: true,
                    // onConfirm={handleReload}
                    msg: error.message,
                });
            });
    }

    const handleClaimFinalYield = async () => {
        contractInstance.methods.claimFinalYield()
            .send()
            .on('transactionHash', () => {
                setClaimingYield(true);
            })
            .on('receipt', () => {
                setClaimingYield(false);
                fetchContractData();
                setSuccessModal({
                    open: true,
                    msg: "Congratulations 🎉 !! " +
                        "You received your final yield !!",
                });
            })
            .catch((error) => {
                setClaimingYield(false);
                setErrorModal({
                    open: true,
                    msg: error.message,
                });
            });
    }

    const fetchContractData = async () => {
        try {
            let result;
            if (!contractInstance) {
                result = await createContractInstance();
            }

            contractInstance = contractInstance ? contractInstance : result.contract;
            bep20Instance = bep20Instance ? bep20Instance : result.bep20;

            if (contractInstance) {
                const isParticipant = await contractInstance
                    .methods.isParticipant(window.userAddress).call();

                const alreadyTakenLoan = await contractInstance
                    .methods.takenLoan(window.userAddress).call();

                const totalParticipants = await contractInstance
                    .methods.totalParticipants().call();

                const auctionCount = await contractInstance
                    .methods.getAuctionCount().call();

                const highestBidAmount = await contractInstance
                    .methods.highestBidAmount(auctionCount).call();

                const poolCloseTimestamp = await contractInstance
                    .methods.poolCloseTimestamp().call();

                let autionStartTimestamp, autionCloseTimestamp;
                if (Number(totalParticipants) > 1) {
                    autionStartTimestamp = await contractInstance
                        .methods.nextAutionStartTimestamp().call();

                    autionCloseTimestamp = await contractInstance
                        .methods.nextAutionCloseTimestamp().call();
                }

                let isLoanWinner = false, winnerInAuction = 0;
                if (Number(auctionCount) > 0) {
                    const loanStatus = await contractInstance
                        .methods.checkWinnerStatus(window.userAddress).call();

                    winnerInAuction = loanStatus[1];

                    if (winnerInAuction < auctionCount ||
                        (Number(auctionCount) === Number(totalParticipants) - 1 &&
                            time.currentUnixTime() > Number(autionCloseTimestamp))
                    ) {
                        isLoanWinner = loanStatus[0];
                    }
                }

                let loanAmount;
                if (isLoanWinner || alreadyTakenLoan) {
                    loanAmount = await contractInstance
                        .methods.loanAmount(window.userAddress).call();
                }

                let claimedFinalYield;
                if (time.currentUnixTime() >= Number(poolCloseTimestamp)) {
                    claimedFinalYield = await contractInstance
                        .methods.claimedFinalYield(window.userAddress).call();
                }

                let bep20Balance = await precision.remove(await bep20Instance
                    .methods.balanceOf(window.userAddress).call(), 18);

                const minBidAmount = Number(await contractInstance
                    .methods.minimumBidAmount().call());

                const depositAmount = Number(await contractInstance
                    .methods.depositAmount().call());

                const auctionInterval = Number(await contractInstance
                    .methods.auctionInterval().call())

                const poolStartTimestamp = Number(await contractInstance
                    .methods.poolStartTimestamp().call());

                const maxParticipants = Number(await contractInstance
                    .methods.maxParticipants().call());

                const maxBidAmount = depositAmount / maxParticipants;

                setState({
                    isParticipant,
                    alreadyTakenLoan,
                    loanAmount,
                    totalParticipants,
                    auctionCount,
                    autionStartTimestamp,
                    autionCloseTimestamp,
                    highestBidAmount,
                    isLoanWinner,
                    winnerInAuction,
                    poolCloseTimestamp,
                    bep20Balance,
                    maxBidAmount,
                    claimedFinalYield,
                    minBidAmount,
                    depositAmount,
                    auctionInterval,
                    createdAt: poolStartTimestamp,
                });
                setShowParticipate(false);
                setShowBid(false);

                setLoading(false);
            }
        } catch (error) {
            setErrorModal({
                open: true,
                msg: error.message,
            });
        }
    };

    const createContractInstance = () => {
        return new Promise((resolve, reject) => {
            try {
                const contract = new window.web3.eth.Contract(
                    poolAbi.default,
                    poolAddress,
                    { from: window.userAddress }
                );

                const bep20 = new window.web3.eth.Contract(
                    bep20Abi.default,
                    BUSD,
                    { from: window.userAddress }
                );

                setBep20Instance(bep20);
                setContractInstance(contract);
                resolve({ contract, bep20 });
            } catch (error) {
                reject(error);
            }
        });
    };

    const getTokenSymbol = () => {
        return "BUSD";
    }

    useEffect(() => {
        if (typeof window.ethereum === 'undefined' ||
            !window.ethereum.isConnected() ||
            !window.ethereum.selectedAddress
        ) {
            setLoading(false);
            setShowMetamaskError(true);
        }

        if (typeof window.ethereum !== 'undefined' &&
            window.ethereum.selectedAddress &&
            window.ethereum.isConnected() &&
            !state.isParticipant
        ) {
            fetchContractData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        routes = <Loading />;
    } else {
        routes = (
            <div>
                {showMetamaskError ?
                    <AlertModal
                        open={showMetamaskError}
                        toggle={() => {
                            setShowMetamaskError(false);
                            history.push('/');
                        }}
                    >
                        <div>
                            {typeof window.ethereum === 'undefined' ?
                                <div>
                                    You can't use these features without Metamask.
                                <br />
                                Please install
                                <Image width="50px" src={metamask}></Image>
                                first !!
                            </div>
                                :
                                <div>
                                    Please connect to
                                <Image width="50px" src={metamask}></Image>
                                to use this feature !!
                            </div>
                            }
                        </div>
                    </AlertModal>
                    :
                    <CardDeck>
                        <Card className="hidden-card"></Card>

                        <Card className="mx-auto view-pool-card">
                            <Card.Body style={{ textAlign: "left", fontWeight: "bold" }}>
                                <p className="view-pool-header">
                                    <u>Venus Chit Fund Pool</u>
                                </p>

                                <Row style={{ paddingBottom: "20px" }}>
                                    <Col>
                                        <u>Total Participants</u>
                                        <span> :</span>
                                        <span className="float-right">
                                            {state.totalParticipants}
                                        </span>
                                    </Col>

                                    <Col>
                                        <u>Lending Pool</u>
                                        <span> :</span>
                                        <span className="float-right">
                                            Venus
                                        </span>
                                    </Col>
                                </Row>

                                <Row style={{ paddingBottom: "20px" }}>
                                    <Col>
                                        <u>Auction Done</u>
                                        <span> :</span>
                                        <span className="float-right">
                                            {state.totalParticipants > 1 ?
                                                state.auctionCount - 1
                                                : 0
                                            }
                                        </span>
                                    </Col>

                                    <Col>
                                        <u>Deposit Amount</u>
                                        <span> :</span>
                                        <span className="float-right">
                                            <span>{state.depositAmount} {getTokenSymbol()}</span>
                                        </span>
                                    </Col>
                                </Row>

                                <Row style={{ paddingBottom: "20px" }}>
                                    <Col>
                                        <u>Max Bid Amount</u>
                                        <span> : </span>
                                        <span className="float-right">
                                            <span>{state.maxBidAmount} {getTokenSymbol()}</span>
                                        </span>
                                    </Col>

                                    <Col>
                                        <u>Min Bid Amount</u>
                                        <span> : </span>
                                        <span className="float-right">
                                            <span>{state.minBidAmount} {getTokenSymbol()}</span>
                                        </span>
                                    </Col>
                                </Row>

                                {state.totalParticipants > 1 &&
                                    Number(state.autionCloseTimestamp) > time.currentUnixTime() ?
                                    <div>
                                        {time.currentUnixTime() < state.autionStartTimestamp ?
                                            <Row className="text-center" style={{ paddingBottom: "20px" }}>
                                                <Col>
                                                    <u>Next Auction Start</u>
                                                    <span> : </span>
                                                    <span>
                                                        {time.getRemaingTime(state.autionStartTimestamp)}
                                                    </span>
                                                </Col>
                                            </Row>
                                            :
                                            <div style={{ marginTop: "10px" }}>
                                                <div className="auction-message">
                                                    Auction Going On
                                                </div>
                                                <Row className="text-center" style={{ paddingBottom: "20px" }}>
                                                    <Col>
                                                        <u>Highest Bid Amount</u>
                                                        <span> : </span>
                                                        <span>
                                                            {state.highestBidAmount} {getTokenSymbol()}
                                                        </span>
                                                    </Col>
                                                </Row>
                                            </div>
                                        }

                                        <Row className="text-center">
                                            <Col>
                                                <u>Auction Close In</u>
                                                <span> : </span>
                                                <span>
                                                    {time.getRemaingTime(state.autionCloseTimestamp)}
                                                </span>
                                            </Col>
                                        </Row>
                                    </div>
                                    : (state.totalParticipants > 1 ?
                                        (
                                            Number(state.poolCloseTimestamp) < time.currentUnixTime() ?
                                                <div className="auction-alert-message">
                                                    Pool Already Closed
                                                </div>
                                                :
                                                <Row className="text-center">
                                                    <Col>
                                                        <u>Pool Closing In</u>
                                                        <span> : </span>
                                                        <span>
                                                            {time.getRemaingTime(state.poolCloseTimestamp)}
                                                        </span>
                                                    </Col>
                                                </Row>
                                        )
                                        : null
                                    )
                                }

                                {showBid ?
                                    <Bid
                                        contractInstance={contractInstance}
                                        totalAmount={state.depositAmount}
                                        token={getTokenSymbol()}
                                        callback={fetchContractData}
                                    />
                                    : null}

                                {showParticipate ?
                                    (Number(state.bep20Balance) >= state.depositAmount ?
                                        <Participate
                                            poolAddress={poolAddress}
                                            contractInstance={contractInstance}
                                            bep20Instance={bep20Instance}
                                            buyToken={getTokenSymbol()}
                                            availableBalance={state.bep20Balance}
                                            balanaceNeeded={state.depositAmount}
                                            callback={fetchContractData}
                                        />
                                        : null
                                    )
                                    : null}
                            </Card.Body>

                            {state.isParticipant ?
                                (time.currentUnixTime() >= Number(state.poolCloseTimestamp) ?
                                    (!state.claimedFinalYield ?
                                        <Card.Footer className="view-pool-footer">
                                            <Button
                                                onClick={handleClaimFinalYield}
                                                variant="success"
                                            >
                                                {claimingYield ?
                                                    <div className="d-flex align-items-center">
                                                        Processing
                                                    <span className="loading ml-2"></span>
                                                    </div>
                                                    :
                                                    <div>Claim Final Yield</div>
                                                }
                                            </Button>
                                        </Card.Footer>
                                        :
                                        <div className="info-message">
                                            Thank you for your participation in the pool.<br />
                                            You have already claimed your Final yield. <br />
                                            Hope to see you on other pools
                                            <span role="img" aria-label="smile-emoji"> 🙂</span>
                                        </div>
                                    ) : (state.alreadyTakenLoan ?
                                        <div className="info-message">
                                            Congratulations
                                            <span role="img" aria-label="congratualation-emoji"> 🎉</span><br />
                                            You have already won a Loan of amount {state.loanAmount} {getTokenSymbol()}<br />
                                            Now, You can't take part in bidding process.
                                        </div>
                                        : (!state.isLoanWinner &&
                                            time.currentUnixTime() > Number(state.autionStartTimestamp) &&
                                            time.currentUnixTime() < Number(state.autionCloseTimestamp) ?
                                            <div>
                                                {state.userCurrentBid > 0 && !showBid ?
                                                    <div className="info-message">
                                                        You have successfully placed your bid
                                                    for this auction.<br />
                                                        <span>
                                                            Your bid is {state.userCurrentBid} {getTokenSymbol()}<br />
                                                        </span>
                                                    </div>
                                                    : null
                                                }

                                                <Card.Footer className="view-pool-footer">
                                                    <Button
                                                        onClick={() => setShowBid(true)}
                                                        variant="warning"
                                                    >
                                                        {state.userCurrentBid > 0 ?
                                                            <div>Want to Bid Higher ?</div>
                                                            :
                                                            <div>Want to Bid ?</div>
                                                        }
                                                    </Button>
                                                </Card.Footer>
                                            </div>

                                            : (state.isLoanWinner ?
                                                <div>
                                                    <div className="info-message">
                                                        You have successfully won the bid in auction {state.winnerInAuction}
                                                        <br />click below button to claim your loan of
                                                            <span> {state.loanAmount} {getTokenSymbol()}.</span>
                                                    </div>
                                                    <Card.Footer className="view-pool-footer">
                                                        <Button
                                                            onClick={handleClaimLoan}
                                                            variant="success"
                                                        >
                                                            {claimingLoan ?
                                                                <div className="d-flex align-items-center">
                                                                    Processing
                                                                    <span className="loading ml-2"></span>
                                                                </div>
                                                                :
                                                                <div>Claim Your Loan</div>
                                                            }
                                                        </Button>
                                                    </Card.Footer>
                                                </div>
                                                :
                                                <div className="info-message">
                                                    Thank you for your participation in the pool.<br />
                                                    {state.totalParticipants <= 1 ?
                                                        <div>
                                                            The bid will start once at least
                                                            one more person join the pool.
                                                        </div>
                                                        :
                                                        <div>
                                                            Please wait till next auction.
                                                        </div>
                                                    }
                                                </div>
                                            )
                                        )
                                    )
                                ) : (time.currentUnixTime() < (state.createdAt + state.auctionInterval * 3600) ?
                                    <Card.Footer className="view-pool-footer">
                                        <Button
                                            onClick={() => setShowParticipate(true)}
                                            variant="success"
                                        >
                                            Want to Participate ?
                                    </Button>
                                    </Card.Footer>
                                    :
                                    <div className="alert-message">
                                        Participation time already over.<br />
                                        Please check other Pools.
                                    </div>
                                )
                            }
                        </Card>

                        <Card className="hidden-card"></Card>
                    </CardDeck>
                }

                <AlertModal
                    open={errorModal.open}
                    toggle={() => setErrorModal({
                        ...errorModal, open: false
                    })}
                >
                    {errorModal.msg}
                </AlertModal>

                <SuccessModal
                    open={successModal.open}
                    toggle={() => setSuccessModal({
                        ...successModal, open: false
                    })}
                >
                    {successModal.msg}
                </SuccessModal>
            </div >
        );
    }

    return routes;
}
