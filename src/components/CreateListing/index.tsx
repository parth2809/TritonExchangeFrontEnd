import React, { useState } from 'react';
import { connect } from 'react-redux';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';
import InputGroup from 'react-bootstrap/InputGroup';
import Carousel from 'react-bootstrap/Carousel';
import Card from 'react-bootstrap/Card';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './index.module.scss';
import addPhoto from '../../assets/img/add-photo.png';
import { rootState } from '../../redux/reducers';
import { createListing, uploadPictures } from '../../api/index';

import TagsDiv from '../Tags/Tags';

interface CreateListingProps {
  user: firebase.User | null | undefined;
  show: boolean;
  setShow: Function;
  setReloadHome: Function;
}

const mapStateToProps = (state: rootState) => ({
  user: state.auth.user,
});

const CreateListing: React.FC<CreateListingProps> = ({ user, show, setShow, setReloadHome }) => {
  const [pictures, setPictures]: [string[], Function] = useState([]);
  const [pictureFiles, setPictureFiles]: [File[], Function] = useState([]);
  const [dispValidated, setDispValidated] = useState(false);
  const [form, setForm] = useState<HTMLFormElement>();
  const [activeIndex, setActiveIndex] = useState(0);
  let titleInput;
  let priceInput;
  let descriptionInput;
  let locationInput;

  // tags
  const dispTags = [
    'Tutoring',
    'Housing',
    'Rideshare',
    'Study Material',
    'Clothes',
    'Furniture',
    'Electronics',
    'Appliances',
    'Fitness',
    'Other',
    'On-Campus Pickup',
    'Off-Campus Pickup',
    'Venmo',
    'Cash',
    'Dining Dollars',
    'Free',
  ];

  const initTags = {};
  dispTags.map((tag) => {
    initTags[tag] = false;
  });

  const [tags, setTags] = useState<any>({ ...initTags });

  const resetForm = async (clearValidate: boolean) => {
    // reset pictures
    setPictures([]);
    setPictureFiles([]);

    // reset validation
    if (clearValidate) {
      setDispValidated(false);
    }

    // reset tags
    const resetTags = {};
    dispTags.map((tag) => {
      resetTags[tag] = false;
    });
    setTags(resetTags);
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        setShow(false);
        resetForm(true);
      }}
      size="lg"
    >
      <Card className="myCard">
        <Form validated={dispValidated} className={styles.wrapper} ref={(ref) => setForm(ref)}>
          <Form.Row className="justify-content-center text-center">
            <p className="mediumHeader">Create Listing</p>
            <button type="button" onClick={() => setShow(false)} className="exitButton exitPad">
              <FontAwesomeIcon icon={faTimes} size="lg" className={styles.exitFlag} />
            </button>
          </Form.Row>
          <Form.Row className="justify-content-center text-center">
            <Form.Group as={Col} md="6">
              <Form.Label className="bodyText">What are you selling?</Form.Label>
              <Form.Control
                placeholder="Title"
                className={styles.input}
                required
                maxLength={20}
                ref={(ref) => {
                  titleInput = ref;
                }}
              />

              <Form.Label className="bodyText">For how much?</Form.Label>
              <InputGroup>
                <InputGroup.Text className={styles.inputPrepend}>$</InputGroup.Text>
                <Form.Control
                  placeholder="Price in Dollars"
                  type="number"
                  min={0}
                  required
                  className={styles.inputWithPrependAndPostpend}
                  ref={(ref) => {
                    priceInput = ref;
                  }}
                />
                <InputGroup.Text className={styles.inputPostpend}>.00</InputGroup.Text>
              </InputGroup>

              <Form.Label className="bodyText">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Description..."
                required
                className={styles.textarea}
                ref={(ref) => {
                  descriptionInput = ref;
                }}
              />

              <Form.Label className="bodyText">Pickup Location</Form.Label>
              <Form.Control
                required
                placeholder="Price Center"
                defaultValue="Price Center"
                className={styles.input}
                ref={(ref) => {
                  locationInput = ref;
                }}
              />
            </Form.Group>

            <Form.Group as={Col} md={{ span: 5, offset: 1 }}>
              <Form.Label>Add Images</Form.Label>
              <Form.Row className="justify-content-center text-center">
                <Carousel
                  activeIndex={activeIndex}
                  onSelect={(selectedIndex) => setActiveIndex(selectedIndex)}
                  className={styles.editListingCarousel}
                >
                  {pictures.length !== 0 ? (
                    pictures.map((src, i) => {
                      return (
                        <Carousel.Item key={i}>
                          <img src={src} className={styles.carouselImage} alt="carousel" />
                          <button
                            type="button"
                            onClick={() => {
                              // remove picture
                              let removedPicIndex: number;
                              setPictures(
                                pictures.filter((pic, j) => {
                                  if (pic === src) {
                                    removedPicIndex = j;
                                  }
                                  return pic !== src;
                                }),
                              );
                              setPictureFiles(
                                pictureFiles.filter((file, j) => !(removedPicIndex === j)),
                              );
                              if (activeIndex !== 0) setActiveIndex(activeIndex - 1);
                            }}
                            className={styles.deleteButton}
                          >
                            <FontAwesomeIcon icon={faTrashAlt} size="lg" />
                          </button>
                        </Carousel.Item>
                      );
                    })
                  ) : (
                    <Carousel.Item key={0}>
                      <img src={addPhoto} alt="Listing" />
                    </Carousel.Item>
                  )}
                </Carousel>
                <Form.File
                  id="upload-pictures-create-listing"
                  accept="image/*"
                  multiple
                  label="Browse..."
                  data-browse="+"
                  custom
                  isValid={false}
                  onChange={(e: any) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const uploadingPics: string[] = [];
                      const uploadingPicFiles: File[] = [];
                      for (let i = 0; i < e.target.files.length; i += 1) {
                        if (e.target.files[i]) {
                          uploadingPics.push(URL.createObjectURL(e.target.files[i]));
                          uploadingPicFiles.push(
                            new File([e.target.files[i]], 'listingPicture.jpeg', {
                              lastModified: Date.now(),
                            }),
                          );
                        }
                      }
                      setPictures(pictures.concat(uploadingPics));
                      setPictureFiles(pictureFiles.concat(uploadingPicFiles));
                      e.target.value = '';
                    }
                  }}
                />
              </Form.Row>
            </Form.Group>
          </Form.Row>

          <Form.Row className="justify-content-center text-center">
            <Form.Label className="bodyText">Tags</Form.Label>
            <Form.Row className="justify-content-center text-center">
              <TagsDiv
                tags={dispTags}
                setTag={(tag: string, active: boolean) => {
                  const temp = { ...tags };
                  temp[tag] = active;
                  setTags({ ...temp });
                }}
              />
            </Form.Row>
          </Form.Row>

          <Form.Row className="justify-content-center text-center">
            <Button
              className={styles.button}
              onClick={async () => {
                // validate form here
                setDispValidated(true);

                // check if forms are valid
                if (
                  !form?.checkValidity() ||
                  !(titleInput && priceInput && descriptionInput && locationInput)
                ) {
                  toast('Make sure to fill out all necessary forms before submitting!');
                  return;
                }
                if (pictures.length <= 0) {
                  toast('Make sure to upload at least 1 photo before submitting');
                  return;
                }

                // extract values from form
                const parsedTitle = titleInput.value;
                const parsedPrice = Number(priceInput.value);
                const parsedDescription = descriptionInput.value;
                const parsedLocation = locationInput.value;

                // extract tags
                const parsedTags = dispTags.filter((tag) => tags[tag]);

                // upload pics to s3
                let pictureURLs;
                if (pictureFiles.length > 0 && pictures.length > 0) {
                  // if uploaded pictures
                  pictureURLs = await uploadPictures(user, pictureFiles);
                  if (!pictureURLs) {
                    // error while uploading
                    toast(
                      'An error occurred while uploading your listing pictures! Please try resubmitting or reuploading.',
                    );
                    return;
                  }
                } else {
                  // no pictures to upload
                  /*                   pictureURLs = ["https://triton-exchange-bucket-photos.s3.amazonaws.com/full-app-logo.svg"]; */
                  pictureURLs = undefined;
                }

                // create the listing in the db
                const success = await createListing(
                  user,
                  parsedTitle,
                  parsedPrice,
                  parsedDescription,
                  parsedLocation,
                  parsedTags,
                  pictureURLs,
                );

                if (success) {
                  setReloadHome(true);
                  setShow(false);
                  toast('The listing was successfully created!');
                } else {
                  toast(
                    'There was an error while creating your listing! Try to create it again or reload.',
                  );
                }
                resetForm(true);
              }}
            >
              Create
            </Button>
          </Form.Row>
        </Form>
      </Card>
    </Modal>
  );
};

export default connect(mapStateToProps)(CreateListing);
