// /*
//  * Client-side JavaScript part
 
//  App = {

//     constructor() {
//         //these two lines allow to reference "this" keyword inside of captureFile and onSubmit functions
//         this.captureFile = this.captureFile.bind(this)
//         this.onSubmit = this.onSubmit.bind(this);
//     },
    
//     captureFile(event) {
//         console.log('capture file...');
//         //event.preventDefault();
//         //const uploadedFile = document.getElementById('myFile');
//         //const file=fileSelector.datafile.value;
//         //console.log(file);
//         const files = event.target.files;
//         //const reader = new window.FileReader();
//         //reader.readAsArrayBuffer(file);
//         //reader.onloadend = () => {
//             //this.setState({ buffer: Buffer.from(reader.result) });
//             //console.log('buffer', this.state.buffer);
//         //}
//     },

//     onSubmit(event) {
//         //used to stay in the same html page while clicking on the submit button, because the default behaviour would submit a form
//         event.preventDefault();
//         console.log('on submit...');
//     }
    
// }
