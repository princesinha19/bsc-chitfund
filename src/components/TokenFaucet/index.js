import React, { useEffect, useState } from "react";
import Loading from "../Utils/Loading";
import history from "../Utils/history";
import AlertModal from "../Utils/AlertModal";
import SuccessModal from "../Utils/SuccessModal";
import metamask from "../../assets/metamask.png";
import { Button, Card, CardDeck, Image } from "react-bootstrap";

export default function TokenFaucet() {
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const [errorModal, setErrorModal] = useState({
        msg: "",
        open: false
    });
    const [successModal, setSuccessModal] = useState({
        msg: "",
        open: false
    });
    const [showMetamaskError, setShowMetamaskError] = useState(
        false
    );
    const [tokens] = useState([
        {
            name: "BUSD",
            address: "0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47",
            status: false
        }
    ]);

    const handleGetTestTokens = (tokenAddress) => {
        window.tokenFaucet.methods
            .claimTestTokens(tokenAddress)
            .send()
            .on('transactionHash', () => {
                setProcessing(true);
            })
            .on('receipt', (_) => {
                setProcessing(false);
            })
            .catch((error) => {
                setProcessing(false);
                setErrorModal({
                    open: true,
                    msg: error.message,
                });
            });
    }

    const checkIsAlreadyClaimed = () => {
        tokens.forEach(async (token, i) => {
            const status = await window.tokenFaucet
                .methods.alreadyClaimed(
                    window.userAddress,
                    token.address,
                ).call();

            tokens[i].status = status;

            if (i === tokens.length - 1) {
                setLoading(false);
            }
        });
    }

    useEffect(() => {
        if (typeof window.ethereum === 'undefined' ||
            !window.ethereum.selectedAddress
        ) {
            setLoading(false);
            setShowMetamaskError(true);
        } else {
            checkIsAlreadyClaimed();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return <Loading />
    };

    return (
        <div style={{marginTop: "8%"}}>
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

                    <Card className="view-pool-card">
                        <Card.Header>
                            <u>Token Faucet</u>
                        </Card.Header>

                        <Card.Body>
                            <div style={{ marginBottom: "30px" }}>
                                <strong>Don't have Binance Smart Chain (BNB) Token ?</strong>
                                <br />Please use <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://testnet.binance.org/faucet-smart"
                                    style={{ fontWeight: "bold", lineHeight: "40px" }}
                                > BSC Testnet Faucet </a>
                            to get some token on {window.userAddress}
                            </div>

                            {tokens.map((token, key) => (
                                <Card
                                    key={key}
                                    className="mx-auto form-card text-center"
                                    style={{
                                        backgroundColor: "rgb(253, 255, 255)",
                                        marginTop: "4%",
                                        marginBottom: "4%"
                                    }}
                                >
                                    <Card.Header>
                                        <u>{token.name} Faucet</u>
                                    </Card.Header>

                                    {!token.status ?
                                        <Card.Body>
                                            <p>
                                                You can get 100 Test Venus <strong>{token.name} </strong>
                                            (one time) by clicking below button:
                                            <br />
                                            </p>

                                            <Button
                                                style={{ marginTop: '10px' }}
                                                variant="success"
                                                onClick={() =>
                                                    handleGetTestTokens(token.address)
                                                }
                                            >
                                                {processing ?
                                                    <div className="d-flex align-items-center">
                                                        Processing
                                                <span className="loading ml-2"></span>
                                                    </div>
                                                    :
                                                    <div>
                                                        GET 100 {token.name}
                                                    </div>
                                                }
                                            </Button>
                                        </Card.Body>

                                        :
                                        <Card.Body>
                                            <p style={{ color: "gray" }}>
                                                You have already claimed your 100 {token.name}.
                                        </p>
                                            <p style={{ marginTop: "30px", fontWeight: "bold" }}>
                                                Maybe you need to use a different account?
                                        </p>
                                        </Card.Body>
                                    }
                                </Card>
                            ))}
                        </Card.Body>
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
