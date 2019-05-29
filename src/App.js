import React, { Component } from 'react';
import io from 'socket.io-client';

class App extends Component {
    API_URL = 'http://localhost:8080/api'

    //process.env.REACT_APP_API_URL;

    constructor(props) {
        super(props);

        this.state = {
            inputData: "",
            data: []
        };

        this.getData = this.getData.bind(this);
        this.click = this.click.bind(this);
        this.change = this.change.bind(this);
        this.postData = this.postData.bind(this);
    }

    SOCKET_URL = 'http://localhost:8080/my_app';
    componentDidMount() {
        this.getData(); // Get the old data
        const socket = io(this.SOCKET_URL);
        socket.on('connect', () => {
            console.log("Connected to socket.io!");
            socket.emit('hello', "Kristian", "howdy");
        });

        socket.on('new-data', (data) => {
            console.log(`server msg: ${data.msg}`);
            this.getData(); // Get the new data using fetch!
        });
   
    }

    getData() {
        fetch(`${this.API_URL}/data`)
            .then(response => response.json())
            .then(data => {
                this.setState({
                    data: data
                });
            })
            .catch(error => {
                console.error("Error when fetching: ", error);
            })
    }

    postData(data) {
        fetch(`${this.API_URL}/data`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({ data: data })
        })
            .then(response => response.json())
            .then(data => console.info(data))
            .then(this.getData())
            .catch(error => {
                console.error("Error when posting: ", error);
            })
    }

    change(event) {
        this.setState({ input: event.target.value })
    }

    click() {
        console.log("click", this.state.input);
        this.postData(this.state.input);
    }

    render() {
        let list = this.state.data.map((elm, index) => <li key={index}>{elm}</li>);

        return (
            <div className="container">
                <h1>MERN socket io chat example</h1>
                <p>Post new data:</p>
                <input onChange={this.change} type="text" />
                <button onClick={this.click}>Post</button>
                <p>Data from API:</p>
                <p>Data data</p>
                <ol>
                    {list}
                </ol>
            </div>
        );
    }
}

export default App;
