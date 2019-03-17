from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
def show_jobflow():
   return render_template('jobflow.html')

if __name__ == "__main__":
   app.run()
