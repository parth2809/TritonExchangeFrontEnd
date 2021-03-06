import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Row, Col, Image } from 'react-bootstrap';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import Rating from '@material-ui/lab/Rating';
import Box from '@material-ui/core/Box';
import { fetchListings, getUserProfile } from '../../api/index';
import styles from './index.module.scss';
import { rootState } from '../../redux/reducers';
import Listing from '../../components/ProfileListing/Listing';
import { ReportUser } from '../../components/ReportModals';
import EditProfile from '../../components/EditProfile/index';
import ContactSeller from '../../components/ContactSeller';

interface ProfileProps {
  user: firebase.User | null | undefined;
  targetUserId: string | undefined;
  profilePicture: string;
}

const mapStateToProps = (state: rootState) => ({
  user: state.auth.user,
  profilePicture: state.auth.profilePicture,
});

const Profile: React.FC<ProfileProps> = ({ user, targetUserId, profilePicture }) => {
  const [reloadProfile, setReloadProfile] = useState(true);
  const [profile, setProfile] = useState<any>();
  const [userEquals, setUserEquals] = useState(false);
  const getAndSetProfile = useCallback(async () => {
    const result = await getUserProfile(user, targetUserId);
    setProfile(result);
    return result;
  }, [targetUserId, user]);

  const [availArray, setAvailArray] = useState<any>();
  const [boughtArray, setBoughtArray] = useState<any>();
  const [soldArray, setSoldArray] = useState<any>();

  const availListings = useCallback(
    async (result: any) => {
      const listingArray: any = [];
      const ids: any = [];
      const creationTimes: any = [];

      if (result === undefined || result.activeListings.length === 0) {
        return;
      }

      for (let k = 0; k < result.activeListings.length; k += 1) {
        ids.push(result.activeListings[k][0]);
        creationTimes.push(result.activeListings[k][1]);
      }

      const listings = await fetchListings(user, ids, creationTimes);
      if (listings) {
        listings.map((listing) => {
          listingArray.push(
            <Listing
              reloadProfile={setReloadProfile}
              user={listing.user}
              title={listing.title}
              postDate={listing.creationTime}
              pictures={listing.pictures}
              price={listing.price}
              listingId={listing.listingId}
            />,
          );
        });
        setAvailArray(listingArray);
      }
    },
    [user],
  );

  const soldListings = useCallback(
    async (result: any) => {
      const listingArray: any = [];
      const ids: any = [];
      const creationTimes: any = [];
      if (result === undefined || result.soldListings.length === 0) {
        return;
      }
      for (let k = 0; k < result.soldListings.length; k += 1) {
        ids.push(result.soldListings[k][0]);
        creationTimes.push(result.soldListings[k][1]);
      }
      const listings = await fetchListings(user, ids, creationTimes);
      listings.map((listing) => {
        listingArray.push(
          <Listing
            reloadProfile={setReloadProfile}
            user={listing.user}
            title={listing.title}
            postDate={listing.creationTime}
            pictures={listing.pictures}
            price={listing.price}
            listingId={listing.listingId}
          />,
        );
      });
      setSoldArray(listingArray);
    },
    [user],
  );

  const boughtListings = useCallback(
    async (result: any) => {
      const listingArray: any = [];
      const ids: any = [];
      const creationTimes: any = [];
      if (result === undefined || result.boughtListings.length === 0) {
        return;
      }
      for (let k = 0; k < result.boughtListings.length; k += 1) {
        ids.push(result.boughtListings[k][0]);
        creationTimes.push(result.boughtListings[k][1]);
      }

      const listings = await fetchListings(user, ids, creationTimes);

      if (listings) {
        listings.map((listing) => {
          listingArray.push(
            <Listing
              reloadProfile={setReloadProfile}
              user={listing.user}
              title={listing.title}
              postDate={listing.creationTime}
              pictures={listing.pictures}
              price={listing.price}
              listingId={listing.listingId}
            />,
          );
        });
      }
      setBoughtArray(listingArray);
    },
    [user],
  );

  const functionHandler = useCallback(async () => {
    const result = await getAndSetProfile();
    await availListings(result);
    await soldListings(result);
    await boughtListings(result);
  }, [availListings, soldListings, boughtListings, getAndSetProfile]);

  useEffect(() => {
    if (targetUserId === undefined) {
      setUserEquals(true);
    }
    if (reloadProfile === true) {
      functionHandler();
      setReloadProfile(false);
    }
  }, [targetUserId, reloadProfile, functionHandler]);

  const [showReportUser, setShowReportUser] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [contactSeller, contactSellerSetter] = useState(false);

  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 4,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };
  document.body.style.padding = '0px';
  document.body.style.minHeight = '100%';
  return profile ? (
    <>
      <EditProfile
        show={showEditProfile}
        setShow={setShowEditProfile}
        phoneProp={profile?.phone}
        pictureProp={profilePicture}
        nameProp={profile?.name}
        updateProfilePage={getAndSetProfile}
      />
      <ContactSeller showPopup={contactSeller} setter={contactSellerSetter} sellerInfo={profile} />

      <Container className={styles.con} fluid>
        <div className="min-vh-100">
          <Row>
            <Col lg={5} xl={3} className={styles.column}>
              <div>
                <Image
                  src={userEquals ? profilePicture : profile?.picture}
                  roundedCircle
                  alt="profile"
                  className={styles.img}
                  fluid
                />
              </div>
              <div>
                <Box>
                  <Rating
                    name="read-only"
                    value={(() => {
                      let sum = 0;
                      if (profile?.ratings.length === 0) {
                        return 0;
                      }
                      for (let i = 0; i < (profile?.ratings).length; i += 1) {
                        sum += profile?.ratings[i];
                      }
                      return Math.floor(sum / (profile?.ratings).length);
                    })()}
                    readOnly
                  />
                </Box>
              </div>
              {userEquals ? (
                <>
                  <Button
                    type="submit"
                    variant="outline-primary"
                    className={styles.btnblue}
                    onClick={() => setShowEditProfile(true)}
                  >
                    Edit Profile
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="submit"
                    variant="outline-primary"
                    className={styles.btnblue}
                    onClick={() => contactSellerSetter(true)}
                  >
                    Contact Seller
                  </Button>
                  <Button
                    type="submit"
                    variant="outline-secondary"
                    className={styles.btngrey}
                    onClick={() => setShowReportUser(true)}
                  >
                    Report Seller
                  </Button>
                  {targetUserId && (
                    <ReportUser
                      show={showReportUser}
                      setShow={setShowReportUser}
                      reportedUserId={targetUserId}
                      reportedUserName={profile?.name}
                      reportedProfilePicture={profile?.picture}
                    />
                  )}
                </>
              )}
            </Col>
            <Col lg={7} xl={9}>
              <h2 style={{ textAlign: 'center' }}>{profile?.name}</h2>
              <Row className={styles.row}>
                <div className={styles.outlin}>
                  <p style={{ marginBottom: '0rem', marginLeft: '1rem' }}>Available Listings</p>
                  {availArray && (
                    <Carousel className={styles.car} responsive={responsive}>
                      {availArray}
                    </Carousel>
                  )}
                </div>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col lg={5} xl={3} className={styles.column} />
            <Col lg={7} xl={9}>
              <Row className={styles.row}>
                <div className={styles.outlin}>
                  {userEquals ? (
                    <>
                      <p style={{ marginBottom: '0rem', marginLeft: '1rem' }}>Past Transactions</p>
                      {(soldArray || boughtArray) && (
                        <Carousel className={styles.car} responsive={responsive}>
                          {(() => {
                            if (soldArray === undefined) {
                              return boughtArray;
                            }
                            if (boughtArray === undefined) {
                              return soldArray;
                            }
                            return soldArray.concat(boughtArray);
                          })()}
                        </Carousel>
                      )}
                    </>
                  ) : (
                    <>
                      <p style={{ marginBottom: '0rem', marginLeft: '1rem' }}>Past Listings</p>
                      {soldArray && (
                        <Carousel className={styles.car} responsive={responsive}>
                          {soldArray}
                        </Carousel>
                      )}
                    </>
                  )}
                </div>
              </Row>
            </Col>
          </Row>
        </div>
      </Container>
    </>
  ) : (
    <></>
  );
};

export default connect(mapStateToProps)(Profile);
