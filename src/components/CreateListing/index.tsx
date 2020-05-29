import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Image from 'react-bootstrap/Image';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';
import InputGroup from 'react-bootstrap/InputGroup';
import Carousel from 'react-bootstrap/Carousel';
import Card from 'react-bootstrap/Card';
import CustomToggleButton from '../CustomToggleButton/index';
import styles from './index.module.scss';
import addPhoto from '../../assets/img/add-photo.png';
import { rootState } from '../../redux/reducers';
import { toast } from 'react-toastify';
import { createListing } from '../../api/index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';

interface CreateListingProps {
  user: firebase.User | null | undefined;
  show: boolean;
  setShow: Function;
}

const mapStateToProps = (state: rootState) => ({
  user: state.auth.user,
});
// TODO implemenet tags and upload pictures to s3
const CreateListing: React.FC<CreateListingProps> = ({ user, show, setShow }) => {
  const [pictures, setPictures]: [string[], Function] = useState([]);
  const [dispValidated, setDispValidated] = useState(false);
  const validated = [false, false, false, true];
  const which = { title: 0, price: 1, description: 2, location: 3 };
  let titleInput;
  let priceInput;
  let descriptionInput;
  let locationInput;

  /* const tags = await // API call to database for list of tags goes here */
  const dispTags = ['Furniture', 'Rides', 'Tutoring', 'Appliances', 'Technology'];

  return (
    <Modal show={show} onHide={() => setShow(false)} size="lg">
      <Card>
        <Form validated={dispValidated} className={styles.wrapper}>
          <Form.Row className="justify-content-center text-center">
            <h1>Create Listing</h1>
          </Form.Row>

          <Form.Row className="justify-content-center text-center">
            <Form.Group as={Col} md="6">
              <Form.Label className={styles.text}>What are you selling?</Form.Label>
              <Form.Control
                placeholder="Title"
                className={styles.input}
                required
                ref={(ref) => (titleInput = ref)}
                onChange={(e) => {
                  validated[which.title] = e.target.value.length > 0;
                }}
              />

              <Form.Label className={styles.text}>For how much?</Form.Label>
              <InputGroup>
                <InputGroup.Text className={styles.inputPrepend}>$</InputGroup.Text>
                <Form.Control
                  placeholder="Price in Dollars"
                  type="number"
                  min={0}
                  required
                  className={styles.inputWithPrependAndPostpend}
                  ref={(ref) => (priceInput = ref)}
                  onChange={(e) => {
                    validated[which.price] = e.target.value.length > 0;
                  }}
                />
                <InputGroup.Text className={styles.inputPostpend}>.00</InputGroup.Text>
              </InputGroup>

              <Form.Label className={styles.text}>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Description..."
                required
                className={styles.textarea}
                ref={(ref) => (descriptionInput = ref)}
                onChange={(e) => {
                  validated[which.description] = e.target.value.length > 0;
                }}
              />

              <Form.Label className={styles.text}>Pickup Location</Form.Label>
              <Form.Control
                required
                placeholder="Price Center"
                defaultValue="Price Center"
                className={styles.input}
                ref={(ref) => (locationInput = ref)}
                onChange={(e) => {
                  validated[which.location] = e.target.value.length > 0;
                }}
              />

              <Form.Label className={styles.text}>Tags</Form.Label>
              <Form.Row className="justify-content-center text-center">
                {dispTags.map((tagLabel, i) => {
                  return <CustomToggleButton value={i}>{tagLabel}</CustomToggleButton>;
                })}
              </Form.Row>
            </Form.Group>

            <Form.Group as={Col} md={{ span: 5, offset: 1 }}>
              <Form.Row className="justify-content-center text-center">
                <Form.Label>Add Images</Form.Label>
                <Carousel>
                  {/*pictures.map((src, i) => {
                    if (pictures.length === 1) {
                      return (
                        <Carousel.Item key={i}>
                          <img src={src} />
                        </Carousel.Item>
                      );
                    } else if (src !== addPhoto) {
                      return (
                        <Carousel.Item key={i - 1}>
                          <img src={src} />
                          <button
                            type="button"
                            onClick={() => {
                              setPictures(pictures.filter((x) => x !== src));
                              URL.revokeObjectURL(src);
                            }}
                            className={styles.deleteButton}
                          >
                            <FontAwesomeIcon icon={faTrashAlt} size="lg" />
                          </button>
                        </Carousel.Item>
                      );
                    }
                  })*/}
                  {pictures.length !== 0 ? (
                    pictures.map((src, i) => {
                      return (
                        <Carousel.Item key={i}>
                          <img src={src} />
                          <button
                            type="button"
                            onClick={() => {
                              setPictures(pictures.filter((pic) => pic !== src));
                              URL.revokeObjectURL(src);
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
                      <img src={addPhoto} />
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
                  onChange={(e: any) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const uploadingImgs: string[] = [];
                      for (let i = 0; i < e.target.files.length; i++) {
                        if (e.target.files[i]) {
                          uploadingImgs.push(URL.createObjectURL(e.target.files[i]));
                        }
                      }
                      setPictures(pictures.concat(uploadingImgs));
                    }
                  }}
                />
              </Form.Row>
            </Form.Group>
          </Form.Row>

          <Form.Row className="justify-content-center text-center">
            <Button
              className={styles.button}
              onClick={async () => {
                // validate form here
                setDispValidated(true);

                let allValidated = true;
                for (const singleValidation of validated) {
                  allValidated = allValidated && singleValidation;
                }

                if (!allValidated) {
                  console.log('not all forms are valid!');
                  return;
                }
                console.log('all forms are valid!');

                // extract values from form
                const title = titleInput.value;
                const price = parseInt(priceInput.value);
                const description = descriptionInput.value;
                const location = locationInput.value;
                console.log(title, price, description, location);

                // TODO upload pics to s3, then extract the links and send them to database
                const pictures = ['picture srcs go here'];

                // TODO extract active tags here. Ask aarushi how she did it
                const tags = [];

                const success = await createListing(
                  user,
                  title,
                  price,
                  description,
                  location,
                  tags,
                  pictures,
                );
                if (success) {
                  setShow(false);
                  toast('The listing was successfully created!');
                } else {
                  toast(
                    'There was an error while creating your listing! Try to create it again or reload.',
                  );
                }
              }}
            >
              Create
            </Button>

            <Button className={styles.secondaryButton} onClick={() => setShow(false)}>
              Cancel
            </Button>
          </Form.Row>
        </Form>
      </Card>
    </Modal>
  );
};

export default connect(mapStateToProps)(CreateListing);
