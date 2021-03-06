/** This file is for the popup when you click a listing. Has props for stored listing object and seller profile
 */
/* NEEDS: star rating, pictures */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Carousel } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// import StarRatings from 'react-star-ratings';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import { faTimes, faLink, faHeart } from '@fortawesome/free-solid-svg-icons';
import { faFlag } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Rating from '@material-ui/lab/Rating';
import { toast } from 'react-toastify';
import styles from './listing.module.scss';
import DeletePopup from '../DeletePopup/index';
import ContactSeller from '../ContactSeller/index';
import CommentBox from '../CommentBox';
import ActualEditListing from '../EditListing(actual)/index';
import { fetchListing, saveListing, unsaveListing, getUserProfile } from '../../api/index';
import { rootState } from '../../redux/reducers';
import 'react-toastify/dist/ReactToastify.css';
import { ReportListing } from '../ReportModals';
import Profile from '../../pages/Profile/index';
import RateBuyer from '../RateBuyer';

interface ViewListingProps {
  show: boolean;
  setShow: Function;
  user: firebase.User | null | undefined;
  listingId: string;
  creationTime: number;
  instantChange?: Function;
  reloadListing?: Function;
  reloadHome?: Function;
}

const mapStateToProps = (state: rootState) => ({
  user: state.auth.user,
});

const ViewListing: React.FC<ViewListingProps> = ({
  user,
  show,
  setShow,
  listingId,
  creationTime,
  instantChange,
  reloadListing,
  reloadHome,
}) => {
  /* Popup to show the seller contact information */
  const [contactSeller, contactSellerSetter] = useState(false);
  /* Popup to show listing deletion confirmation */
  const [showDelete, setshowDelete] = React.useState(false);
  /* Stores the listing object */
  const [listingData, setData] = useState<any>(null);
  // listingData: userId, title, price, description, location, pictures TODO
  /* Stores the seller profile of the listing */
  const [sellerInfo, sellerInfoSetter] = useState<any>(null);
  /* Popup to show edit listing */
  const [showEditListing, setShowEditListing] = useState(false);
  const [showReportListing, setShowReportListing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isUsersListing, setIsUsersListing] = useState<any>();
  const [clickedOnProfile, setClickedOnProfile] = useState(false);
  const [markSold, markSoldSetter] = useState(false);
  const [reloadSaved, setReloadSaved] = useState(false);

  const getPictures = () => {
    if (listingData.pictures) {
      return listingData.pictures.map((picture) => {
        return (
          <Carousel.Item>
            <img src={picture} alt="Item" />
          </Carousel.Item>
        );
      });
    }
    return undefined;
  };

  useEffect(() => {
    const fetchListingData = async () => {
      // gets single listing object
      const result = await fetchListing(user, setData, [listingId], [creationTime]);

      if (result) {
        const resultData = result[0];
        setData(resultData);
        // gets the seller profile
        getUserProfile(user, resultData.userId, sellerInfoSetter);
        if (user?.uid === resultData.userId) {
          setIsUsersListing(true);
        }
        // gets your own profile
        const userProfileResult = await getUserProfile(user);
        if (userProfileResult) {
          // eslint-disable-next-line no-restricted-syntax
          for (const savedListing of userProfileResult.savedListings) {
            const sListingId = savedListing[0];
            const sCreationTime = savedListing[1];
            if (sListingId === listingId && sCreationTime === creationTime) {
              setLiked(true);
              break;
            }
          }
        }
      } else {
        toast(
          'There was an error while retrieving your listing details! Please try again or reload the page.',
        );
      }
    };
    if (reloadSaved === true) {
      fetchListingData();
      if (reloadListing) {
        reloadListing(true);
      }
      setReloadSaved(false);
    }
    fetchListingData();
  }, [creationTime, listingId, reloadListing, reloadSaved, user]);

  return clickedOnProfile ? (
    <>
      <Modal
        show={clickedOnProfile}
        onHide={() => setClickedOnProfile(false)}
        size="xl"
        exit
        dialogClassName="profileModal"
      >
        <Container style={{ maxHeight: '50%' }} className="no-gutters">
          <Card className="myCard">
            <Modal.Header closeButton>
              <Profile targetUserId={listingData.userId} />
            </Modal.Header>
          </Card>
        </Container>
      </Modal>
    </>
  ) : (
    listingData && (
      <div>
        {showEditListing && (
          <ActualEditListing
            showDeleteSetter={setshowDelete}
            show={showEditListing}
            setShow={setShowEditListing}
            listingId={listingId}
            creationTime={creationTime}
            titleProp={listingData.title}
            priceProp={listingData.price}
            descriptionProp={listingData.description}
            locationProp={listingData.location}
            tagsProp={listingData.tags}
            picturesProp={listingData.pictures}
            instantChange={instantChange}
            reloadSetter={setReloadSaved}
          />
        )}

        <DeletePopup
          showPopup={showDelete}
          setter={setshowDelete}
          listingSetter={setShow}
          listingObject={listingData}
          reloadSetter={reloadListing}
        />

        {sellerInfo && (
          <ReportListing
            show={showReportListing}
            setShow={setShowReportListing}
            listingId={listingId}
            reportedUserName={sellerInfo.name}
            reportedListingName={listingData.title}
            reportedProfilePicture={sellerInfo.picture}
          />
        )}

        {sellerInfo && (
          <ContactSeller
            showPopup={contactSeller}
            setter={contactSellerSetter}
            sellerInfo={sellerInfo}
          />
        )}

        {sellerInfo && (
          <Modal show={show} onHide={() => setShow(false)} size="xl" className="responsiveModal">
            <Row style={{ maxHeight: '100%', maxWidth: '100%' }} className="no-gutters">
              <Card className="myCard">
                <Row className={styles.pad}>
                  <Col xs={12} md={5} className={styles.textAlign}>
                    <div className="cardImage modalImgWrapper">
                      <Carousel interval={null}>{getPictures()}</Carousel>
                    </div>
                  </Col>
                  <Col xs={12} md={6} className="textAlign blueColor">
                    <Row className="justify-content-center">
                      <h1 className={`${styles.listingTitle} header`}>{listingData.title}</h1>
                    </Row>
                    <Row>
                      <p className={`${styles.listingHeader} subHeader`}>Price</p>
                      <p className={`${styles.listingHeader} subHeader`}>Posted</p>
                      <p className={`${styles.listingHeader} subHeader`}>Pickup</p>
                    </Row>
                    <Row>
                      <p className={`${styles.listingInfo} subHeader`}>
                        <span>$</span>
                        <span>{listingData.price}</span>
                      </p>
                      <p className={`${styles.listingInfo} subHeader`}>
                        {new Date(creationTime).toDateString().split(' ').slice(1).join(' ')}
                      </p>
                      <p className={`${styles.listingInfo} subHeader`}>{listingData.location}</p>
                    </Row>
                    <Row>
                      <p
                        className={`${styles.listingSecondaryInfo} bodyText justify-content-center`}
                      >
                        {listingData.description}
                      </p>
                    </Row>
                  </Col>
                  {/* Button to close the listing modal */}
                  <Col xs={1}>
                    <button
                      type="button"
                      onClick={() => setShow(false)}
                      onKeyDown={() => setShow(false)}
                      className="exitButton"
                    >
                      <FontAwesomeIcon icon={faTimes} size="lg" className={styles.exitFlag} />
                    </button>
                  </Col>
                </Row>
                <Row className={styles.pad} style={{ maxHeight: '100%' }}>
                  {/* Comment section */}
                  <Col xs={12} md={5}>
                    <CommentBox
                      user={user}
                      listingId={listingId}
                      creationTime={creationTime}
                      commentsData={listingData.comments}
                    />
                  </Col>
                  {/* Middle button section */}
                  <Col xs={12} md={2} className={styles.textAlign}>
                    <div>
                      {/* Button will save listing or remove it based on what state it is in */}
                      {!isUsersListing && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (!liked) {
                              const success = await saveListing(user, listingId, creationTime);
                              if (success) {
                                if (instantChange) instantChange();
                                // setNumSaved(numSaved + 1);
                                setLiked(!liked);
                                setReloadSaved(true);
                                toast('This listing has been added to your Saved collection!');
                              } else {
                                toast(
                                  'There has been an error while adding this to your saved collection. Please try again.',
                                );
                              }
                            } else {
                              const success = await unsaveListing(user, listingId, creationTime);
                              if (success) {
                                if (instantChange) instantChange();
                                // setNumSaved(numSaved - 1);
                                setLiked(!liked);
                                setReloadSaved(true);
                                toast('This listing has been removed from your Saved collection!');
                              } else {
                                toast(
                                  'There has been an error while removing this from your saved collection. Please try again.',
                                );
                              }
                            }
                          }}
                          className={styles.myButton}
                        >
                          <FontAwesomeIcon
                            icon={faHeart}
                            size="lg"
                            className={liked ? styles.likedFlag : styles.flag}
                          />
                        </button>
                      )}

                      {/* Button needs to have function to copy item link to clipboard */}
                      <button
                        type="button"
                        onClick={() => {
                          toast('This listing has been saved to your clipboard!');
                          navigator.clipboard.writeText(
                            `Listing: ${listingData.title}\nDate: ${new Date(
                              listingData.creationTime,
                            ).toString()}\nSeller: ${sellerInfo.name}`,
                          );
                        }}
                        className={styles.myButton}
                      >
                        <FontAwesomeIcon icon={faLink} size="lg" className={styles.flag} />
                      </button>

                      {/* Button needs to have function to flag item */}
                      {!isUsersListing && (
                        <button
                          type="button"
                          onClick={() => setShowReportListing(true)}
                          className={styles.myButton}
                        >
                          <FontAwesomeIcon icon={faFlag} size="lg" className={styles.flag} />
                        </button>
                      )}
                    </div>
                  </Col>
                  {/* Bottom right section */}
                  <Col xs={12} md={5}>
                    {/* This div displays seller picture, name, rating, #saved */}
                    <div className={styles.sellerProfile}>
                      <button
                        type="button"
                        className={styles.myButton}
                        onClick={() => setClickedOnProfile(true)}
                      >
                        <img
                          src={sellerInfo.picture}
                          className={styles.sellerPicture}
                          alt="Seller"
                        />
                      </button>
                      <p className={styles.sellerName}>{sellerInfo.name}</p>
                      <Rating
                        name="read-only"
                        value={(() => {
                          let sum = 0;
                          // console.log(sellerInfo?.ratings)
                          if (sellerInfo?.ratings.length === 0) {
                            return 0;
                          }
                          for (let i = 0; i < (sellerInfo?.ratings).length; i += 1) {
                            sum += sellerInfo?.ratings[i];
                          }
                          return Math.floor(sum / (sellerInfo?.ratings).length);
                        })()}
                        readOnly
                      />

                      <div className={styles.interestBox}>
                        <p>
                          <span>{listingData.savedCount}</span>
                          <span> people saved this item</span>
                        </p>
                      </div>
                      {/* This displays either Mark as Sold & Edit Listing OR Contact Seller */}
                      {isUsersListing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => markSoldSetter(true)}
                            className={styles.sellerButton}
                          >
                            Mark as Sold
                          </button>
                          <RateBuyer
                            user={user}
                            closeListing={setShow}
                            setReload={reloadHome || undefined}
                            listingData={listingData}
                            sellerInfo={sellerInfo}
                            title={listingData.title}
                            show={markSold}
                            setShow={markSoldSetter}
                          />
                          <button
                            type="button"
                            className={styles.sellerButton}
                            onClick={() => {
                              setShowEditListing(true);
                            }}
                          >
                            Edit Listing
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => contactSellerSetter(true)}
                          className={styles.sellerButton}
                        >
                          Contact Seller
                        </button>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card>
            </Row>
          </Modal>
        )}
      </div>
    )
  );
};

export default connect(mapStateToProps)(ViewListing);
