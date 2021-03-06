import React, { useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './index.module.scss';
import Listing from '../../components/Listing/Listing';
import { getUserProfile, fetchIdListings } from '../../api';
import { rootState } from '../../redux/reducers';

interface SavedProps {
  user: firebase.User | null | undefined;
}

const mapStateToProps = (state: rootState) => ({
  user: state.auth.user,
});

const Saved: React.FC<SavedProps> = ({ user }) => {
  const [listings, setListings] = useState();

  const rowArray: any = [];

  const callAPI = useCallback(async () => {
    const userProfile = await getUserProfile(user);
    const ids: any = [];
    const creations: any = [];
    userProfile.savedListings.map((listing) => {
      if (!ids.includes(listing[0])) {
        ids.push(listing[0]);
        creations.push(listing[1]);
      }
    });
    if (ids.length !== 0) {
      await fetchIdListings(user, setListings, ids, creations);
    } else {
      setListings(userProfile.savedListings);
    }
  }, [user]);

  useEffect(() => {
    callAPI();
  }, [callAPI]);

  return (
    <div className="min-vh-100">
      <h1 className={styles.title}>Saved Listings</h1>
      {(listings === undefined || listings.length === 0) && <h2>No Saved Listings!</h2>}
      {listings &&
        listings.map((aListing, index) => {
          if (index % 4 === 0 && index + 3 < listings.length) {
            rowArray.push(
              <Row xs={1} md={2} lg={4}>
                <Col>
                  <Listing
                    instantChange={callAPI}
                    user={user}
                    listingId={aListing.listingId}
                    title={aListing.title}
                    price={aListing.price}
                    postDate={aListing.creationTime}
                    pictures={aListing.pictures}
                  />
                </Col>
                <Col>
                  <Listing
                    instantChange={callAPI}
                    user={user}
                    listingId={listings[index + 1].listingId}
                    title={listings[index + 1].title}
                    price={listings[index + 1].price}
                    postDate={listings[index + 1].creationTime}
                    pictures={listings[index + 1].pictures}
                  />
                </Col>
                <Col>
                  <Listing
                    instantChange={callAPI}
                    user={user}
                    listingId={listings[index + 2].listingId}
                    title={listings[index + 2].title}
                    price={listings[index + 2].price}
                    postDate={listings[index + 2].creationTime}
                    pictures={listings[index + 2].pictures}
                  />
                </Col>
                <Col>
                  <Listing
                    instantChange={callAPI}
                    user={user}
                    listingId={listings[index + 3].listingId}
                    title={listings[index + 3].title}
                    price={listings[index + 3].price}
                    postDate={listings[index + 3].creationTime}
                    pictures={listings[index + 3].pictures}
                  />
                </Col>
              </Row>,
            );
          } else if (listings.length % 4 === 1 && listings.length - 1 === index) {
            rowArray.push(
              <Row xs={1} md={2} lg={4}>
                <Listing
                  instantChange={callAPI}
                  user={user}
                  listingId={aListing.listingId}
                  title={aListing.title}
                  price={aListing.price}
                  postDate={aListing.creationTime}
                  pictures={aListing.pictures}
                />
              </Row>,
            );
          } else if (listings.length % 4 === 2 && listings.length - 2 === index) {
            rowArray.push(
              <Row xs={1} md={2} lg={4}>
                <Listing
                  instantChange={callAPI}
                  user={user}
                  listingId={aListing.listingId}
                  title={aListing.title}
                  price={aListing.price}
                  postDate={aListing.creationTime}
                  pictures={aListing.pictures}
                />
                <Listing
                  instantChange={callAPI}
                  user={user}
                  listingId={listings[index + 1].listingId}
                  title={listings[index + 1].title}
                  price={listings[index + 1].price}
                  postDate={listings[index + 1].creationTime}
                  pictures={listings[index + 1].pictures}
                />
              </Row>,
            );
          } else if (listings.length % 4 === 3 && listings.length - 3 === index) {
            rowArray.push(
              <Row xs={1} md={2} lg={4}>
                <Col>
                  <Listing
                    instantChange={callAPI}
                    user={user}
                    listingId={aListing.listingId}
                    title={aListing.title}
                    price={aListing.price}
                    postDate={aListing.creationTime}
                    pictures={aListing.pictures}
                  />
                </Col>
                <Col>
                  <Listing
                    instantChange={callAPI}
                    user={user}
                    listingId={listings[index + 1].listingId}
                    title={listings[index + 1].title}
                    price={listings[index + 1].price}
                    postDate={listings[index + 1].creationTime}
                    pictures={listings[index + 1].pictures}
                  />
                </Col>
                <Col>
                  <Listing
                    instantChange={callAPI}
                    user={user}
                    listingId={listings[index + 2].listingId}
                    title={listings[index + 2].title}
                    price={listings[index + 2].price}
                    postDate={listings[index + 2].creationTime}
                    pictures={listings[index + 2].pictures}
                  />
                </Col>
              </Row>,
            );
          }
        }) && (
          <Container fluid>
            {rowArray.map((row) => (
              <div>{row}</div>
            ))}
          </Container>
        )}
    </div>
  );
};

export default connect(mapStateToProps)(Saved);
