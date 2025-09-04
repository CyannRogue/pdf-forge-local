import typer

from app.services.organize_service import merge_pdfs

app = typer.Typer(help="PDF Forge Local CLI")


@app.command()
def merge(out: str, files: list[str]):
    """Merge multiple PDFs into one."""
    merge_pdfs(files, out)
    typer.echo(f"Wrote {out}")


if __name__ == "__main__":
    app()
