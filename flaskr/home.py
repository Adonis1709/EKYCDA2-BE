from flask import Blueprint, redirect, render_template, request

bp = Blueprint("home", __name__, url_prefix="/")

@bp.route("/")
def index():
    """Show all the posts, most recent first."""
    return render_template("index.html")

@bp.app_errorhandler(404)
def handle_404(err):
    path = "/#!"+request.path
    return redirect(path)

# or, without the decorator