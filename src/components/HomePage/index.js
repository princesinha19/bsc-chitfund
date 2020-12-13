import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { Card, CardDeck, Image } from "react-bootstrap";
import bscLogo from "../../assets/bsc.svg";
import { time } from "../../utils/time";
import Loading from "../Utils/Loading";

export default function HomePage() {
    const [loading, setLoading] = useState(true);
    const [loanPools, setlLoanPools] = useState([]);
    const [noMetamsk, setNoMetamask] = useState(false);

    const createSubArray = (pools) => {
        let chunks = [];

        while (pools.length > 4) {
            chunks.push(pools.splice(0, 4));
        }

        if (pools.length > 0) {
            chunks.push(pools);
        }

        setlLoanPools(chunks);
        setLoading(false);
    }

    const isMetamaskInstalled = () => {
        return (typeof window.ethereum !== 'undefined');
    };

    const getPools = async () => {
        const poolCount = await window.poolFactory
            .methods
            .totalPools().call();

        if (Number(poolCount) === 0) {
            setLoading(false);
        }

        let pools = [];
        for (let i = 0; i < poolCount; i++) {
            const poolAddress = await window.poolFactory
                .methods
                .availablePools(i).call();

            const poolInfo = await window.poolFactory
                .methods
                .poolInfo(poolAddress).call();

            poolInfo.poolAddress = poolAddress;

            pools.push(poolInfo);

            if (i === poolCount - 1) {
                createSubArray(pools);
            }
        }
    }

    useEffect(() => {
        if (!isMetamaskInstalled()) {
            setLoading(false);
            setNoMetamask(true);
        } else if (loanPools.length === 0) {
            getPools();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function DisplayCard({ pool, count }) {
        return (
            <Card key={count} className="display-pool-card" >
                <Link
                    key={count}
                    style={{ textDecoration: "none", color: "black" }}
                    to={`/view/${pool.poolAddress}`}
                >
                    <Card.Header style={{ marginBottom: "5px" }}>
                        <Image
                            src={bscLogo} width="40px"
                            style={{ marginRight: "5px" }}
                        ></Image>
                        <span> Chit Fund Pool</span>
                    </Card.Header>

                    <Card.Body>
                        <div style={{ marginBottom: "10px" }}>
                            Deposit Amount: {pool.depositAmount} BUSD
                        </div>

                        <div style={{ marginBottom: "10px" }}>
                            Maximum Participants: {pool.maxParticipants}
                        </div>

                        <div style={{ marginBottom: "10px" }}>
                            Minimum Bid Amount: {pool.minimumBidAmount} BUSD
                        </div>

                        <div style={{ marginBottom: "10px" }}>
                            Auction Interval: Every {pool.auctionInterval} hours
                        </div>
                        <div style={{ marginBottom: "5px" }}>
                            {time.currentUnixTime() < (
                                Number(pool.createdAt) +
                                Number(pool.auctionInterval) *
                                3600
                            ) ?
                                <span className="info-message">
                                    {time.getTimeInString(
                                        Number(pool.createdAt) +
                                        Number(pool.auctionInterval) *
                                        3600
                                    )}
                                </span>
                                :
                                <span className="warning-message">
                                    Participation Already Over
                                </span>
                            }
                        </div>
                    </Card.Body>
                </Link>
            </Card>
        );
    }

    if (loading) {
        return <Loading />
    };

    return (
        <div>
            {!noMetamsk ?
                (loanPools.map((element, key) => (
                    element.length === 4 ?
                        <CardDeck key={key} style={{ margin: "2%" }}>
                            {element.map((pool, k) => (
                                <DisplayCard key={k} pool={pool} count={k} />
                            ))}
                        </CardDeck>
                        :
                        <CardDeck key={key} style={{ margin: "2%" }}>
                            {element.map((pool, k) => (
                                <DisplayCard key={k} pool={pool} count={k} />
                            ))}

                            {[...Array(4 - element.length)].map((x, i) =>
                                <Card
                                    key={element.length + i + 1}
                                    className="hidden-card"
                                >
                                </Card>
                            )}
                        </CardDeck>
                )))
                : <div
                    className="alert-message"
                    style={{ marginTop: "20%", fontSize: "x-large" }}
                >
                    You don't have metamask. Please install first !!
                </div>
            }
        </div >
    );
}
