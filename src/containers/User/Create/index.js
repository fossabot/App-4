// @flow
import React, { Fragment } from "react";
import { graphql, compose, withApollo } from "react-apollo";
//Components
import AuthLayout from "../../../components/organisms/AuthLayout";
import { Input, Button, Link } from "../../../components/atoms";
import Error from "../../../components/molecules/Error";
import { Footer } from "../../../components/organisms";
//hocs
import { withUser } from "../../../hocs";
//API
import { USERNAME_VALIDATION_QUERY } from "../../../api/Queries";
import {
  SIGIN_USER_MUTATION,
  CREATE_USER_MUTATION
} from "../../../api/Mutations";
import { userSignIn } from "../../../api/Functions";
//Utils
import {
  generateToken,
  generateExpiration,
  _formatUsername,
  _validateEmail,
  _emailBlackList,
  _isLoggedIn
} from "../../../services/utilities";
import LogRocket from "logrocket";

export class CreateUser extends React.PureComponent {
  props: {
    createUser: any,
    signinUser: any,
    history: any,
    client: any,
    router: any
  };
  state = {
    email: "",
    password: "",
    username: "",
    error: false,
    errorMsg: "",
    timeoutUserName: 0,
    timeoutPassword: 0
  };
  componentDidMount() {
    if (_isLoggedIn()) {
      this.props.history.push("/");
    }
  }
  _onCreateUser = () => {
    const { email, password, error } = this.state;
    let username = _formatUsername(this.state.username);

    //Verifies if the inputs are empty or not
    if (email && password && username) {
      if (error) {
        return;
      }

      if (!_validateEmail(email)) {
        this.setState({
          error: true,
          errorMsg: "Email entered is not valid."
        });
        return;
      }

      if (_emailBlackList(email)) {
        this.setState({
          error: true,
          errorMsg: "Sorry, we do not support this email service."
        });
        return;
      }

      if (this._checkPassword(password)) return;
      //Creates a new user
      this.props
        .createUser({
          variables: {
            email,
            password,
            username,
            confirmToken: generateToken(),
            confirmExpires: generateExpiration()
          }
        })
        .then(() => {
          LogRocket.track("Registered");
          this._onSignIn(email, password);
        })
        .catch(e => {
          LogRocket.error({ CreateUser: e });
          this.setState({
            error: true,
            errorMsg:
              "Ops! User already exists with that information, try again."
          });
        });
    } else {
      this.setState({
        error: true,
        errorMsg: "This form is feeling lonely, needs affection, needs data."
      });
    }
  };
  _onSignIn = async (email: string, password: string) => {
    //logs in the user
    const response = await userSignIn(email, password, this.props.signinUser);
    if (response.status) {
      LogRocket.track("Sign in");
      this.props.user.updateUser(response.rest);
      //sends to the dashboard
      this.props.history.push("/");
    } else {
      LogRocket.error({ SignIn: response });
      this.setState({
        error: true,
        errorMsg: "Ops! Something went wrong, try again."
      });
    }
  };
  _onPasswordValidation(password: string) {
    clearTimeout(this.state.timeoutPassword);
    this.setState({
      timeoutPassword: setTimeout(() => {
        this._checkPassword(password);
      }, 500)
    });
  }
  _checkPassword(password: string) {
    if (password.length <= 8) {
      LogRocket.warn(
        "With so much room in the box, you chose this tiny thing. We need more than 8 characters, go we know you can."
      );
      this.setState({
        error: true,
        errorMsg:
          "With so much room in the box, you chose this tiny thing. We need more than 8 characters, go we know you can."
      });
      return true;
    }
    this.setState({ error: false });
  }
  _onUsernameValidation(getUsername: string) {
    clearTimeout(this.state.timeoutUserName);
    this.setState({
      timeoutUserName: setTimeout(() => {
        let username = _formatUsername(getUsername);
        this.props.client
          .query({
            query: USERNAME_VALIDATION_QUERY,
            variables: { username }
          })
          .then(res => {
            if (Object.keys(res.data.allUsers).length !== 0) {
              LogRocket.info(
                "With so much name in this world, you had to choose this one. Try another."
              );
              this.setState({
                error: true,
                errorMsg:
                  "With so much name in this world, you had to choose this one. Try another."
              });
            } else {
              this.setState({ error: false });
            }
          })
          .catch(e => {
            LogRocket.error({ _onUsernameValidation: e });
          });
      }, 500)
    });
  }
  _handleKeyEnter = event => {
    if (event.key === "Enter") {
      this._onCreateUser();
    }
  };
  render() {
    const { email, password, username, error, errorMsg } = this.state;
    const { history } = this.props;
    return (
      <Fragment>
        <AuthLayout description="Seriously? Your forms do not have a home for the data? Do not worry, they will not be without shelter.">
          <label htmlFor="signupUsername" className="sr-only">
            Username
          </label>
          <Input
            id="signupUsername"
            value={username}
            onChange={e =>
              this.setState({ username: e.target.value, error: false })
            }
            onKeyPress={this._handleKeyEnter}
            onKeyUp={e => this._onUsernameValidation(e.target.value)}
            className={`form-control ${error && "is-invalid"}`}
            placeholder="Username"
            required
            autoFocus
          />
          <label htmlFor="signupEmail" className="sr-only">
            Email address
          </label>
          <Input
            id="signupEmail"
            type="email"
            value={email}
            onChange={e =>
              this.setState({ email: e.target.value, error: false })
            }
            onKeyPress={this._handleKeyEnter}
            className={`form-control ${error && "is-invalid"}`}
            placeholder="Email address"
            required
            autoFocus
          />

          <label htmlFor="signupPassword" className="sr-only">
            Password
          </label>
          <Input
            id="signupPassword"
            type="password"
            value={password}
            onChange={e =>
              this.setState({ password: e.target.value, error: false })
            }
            onKeyPress={this._handleKeyEnter}
            onKeyUp={e => this._onPasswordValidation(e.target.value)}
            className={`form-control ${error && "is-invalid"}`}
            placeholder="Password"
            required
            autoFocus
          />

          <Button
            className="btn btn-lg btn-block"
            onClick={this._onCreateUser}
            style={{ marginTop: 10, marginBottom: 10 }}
            primary
          >
            Create Account
          </Button>

          <Link onClick={() => history.push("/signin")}>
            Already have an account? Your forms miss you.{" "}
            <u>
              <strong>Sign In</strong>
            </u>
          </Link>
          <Error show={error}>{errorMsg}</Error>
        </AuthLayout>
        <Footer />
      </Fragment>
    );
  }
}

const createUserWithData = compose(
  withUser,
  graphql(CREATE_USER_MUTATION, { name: "createUser" }),
  graphql(SIGIN_USER_MUTATION, { name: "signinUser" })
);

export default withApollo(createUserWithData(CreateUser));
